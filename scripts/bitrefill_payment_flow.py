#!/usr/bin/env python3
"""
Bitrefill Payment Flow Script
1. Scrapes payment address from Bitrefill checkout page
2. Waits for payment confirmation
3. Extracts gift card code after payment
"""

import json
import sys
import os
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import TimeoutException, NoSuchElementException

def setup_chrome_driver(headless=True):
    """Setup Chrome driver."""
    chrome_options = Options()
    
    # Use temporary profile to avoid conflicts
    import tempfile
    temp_profile = tempfile.mkdtemp(prefix="chrome_automation_")
    chrome_options.add_argument(f"--user-data-dir={temp_profile}")
    
    if headless:
        chrome_options.add_argument("--headless=new")
    else:
        chrome_options.add_argument("--start-maximized")
    
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--disable-blink-features=AutomationControlled")
    chrome_options.add_argument("--disable-extensions")
    chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
    chrome_options.add_experimental_option('useAutomationExtension', False)
    
    try:
        from webdriver_manager.chrome import ChromeDriverManager
        service = Service(ChromeDriverManager().install())
    except ImportError:
        service = Service()
    
    try:
        driver = webdriver.Chrome(service=service, options=chrome_options)
        return driver
    except Exception as e:
        print(f"Warning: First attempt failed: {e}", file=sys.stderr)
        chrome_options_minimal = Options()
        if headless:
            chrome_options_minimal.add_argument("--headless=new")
        chrome_options_minimal.add_argument("--no-sandbox")
        chrome_options_minimal.add_argument("--disable-dev-shm-usage")
        chrome_options_minimal.add_argument(f"--user-data-dir={temp_profile}")
        driver = webdriver.Chrome(service=service, options=chrome_options_minimal)
        return driver

def scrape_payment_address(checkout_url):
    """Scrape the payment address from Bitrefill checkout page."""
    driver = None
    result = {
        "success": False,
        "payment_address": None,
        "error": None,
        "message": None
    }
    
    try:
        headless = os.getenv("HEADLESS", "false").lower() == "true"
        driver = setup_chrome_driver(headless=headless)
        driver.implicitly_wait(10)
        
        print(f"Navigating to Bitrefill checkout: {checkout_url}", file=sys.stderr)
        driver.get(checkout_url)
        
        # Wait for page to load
        time.sleep(3)
        
        # Look for payment address - Bitrefill typically shows it in various places
        payment_address = None
        
        # Try different selectors for the payment address
        address_selectors = [
            (By.CSS_SELECTOR, "[data-testid*='payment-address']"),
            (By.CSS_SELECTOR, "[data-testid*='crypto-address']"),
            (By.CSS_SELECTOR, ".payment-address"),
            (By.CSS_SELECTOR, ".crypto-address"),
            (By.XPATH, "//*[contains(text(), '0x') or contains(text(), 'bc1') or contains(text(), '1')]"),
            (By.CSS_SELECTOR, "code"),
            (By.CSS_SELECTOR, "pre"),
        ]
        
        for by, selector in address_selectors:
            try:
                elements = driver.find_elements(by, selector)
                for elem in elements:
                    text = elem.text.strip()
                    # Look for crypto address patterns
                    if text and (text.startswith("0x") or text.startswith("bc1") or 
                                (len(text) >= 26 and len(text) <= 42 and 
                                 (text.startswith("1") or text.startswith("3")))):
                        # Additional validation - check if it looks like a crypto address
                        if any(char.isalnum() for char in text):
                            payment_address = text
                            break
                if payment_address:
                    break
            except Exception:
                continue
        
        # If not found, try searching page source
        if not payment_address:
            page_source = driver.page_source
            import re
            # Look for common crypto address patterns
            patterns = [
                r'0x[a-fA-F0-9]{40}',  # Ethereum address
                r'bc1[a-z0-9]{39,59}',  # Bitcoin bech32
                r'[13][a-km-zA-HJ-NP-Z1-9]{25,34}',  # Bitcoin legacy
            ]
            for pattern in patterns:
                matches = re.findall(pattern, page_source)
                if matches:
                    payment_address = matches[0]
                    break
        
        if payment_address:
            result["success"] = True
            result["payment_address"] = payment_address
            result["message"] = "Payment address found"
            print(f"Found payment address: {payment_address}", file=sys.stderr)
        else:
            result["error"] = "Could not find payment address"
            result["message"] = "Payment address not found on page. Page may still be loading."
            print("Could not find payment address. Page source snippet:", file=sys.stderr)
            print(driver.page_source[:1000], file=sys.stderr)
        
    except Exception as e:
        result["error"] = str(e)
        result["message"] = f"Error scraping payment address: {str(e)}"
        print(f"Error: {e}", file=sys.stderr)
    finally:
        if driver:
            driver.quit()
    
    return result

def wait_for_payment_and_get_code(checkout_url, max_wait_minutes=10):
    """Wait for payment confirmation, click reveal button, and extract gift card code."""
    driver = None
    result = {
        "success": False,
        "gift_card_code": None,
        "error": None,
        "message": None
    }
    
    try:
        headless = os.getenv("HEADLESS", "false").lower() == "true"
        driver = setup_chrome_driver(headless=headless)
        driver.implicitly_wait(10)
        
        print(f"Waiting for payment confirmation on: {checkout_url}", file=sys.stderr)
        driver.get(checkout_url)
        
        max_wait_seconds = max_wait_minutes * 60
        check_interval = 10  # Check every 10 seconds
        elapsed = 0
        payment_confirmed = False
        
        while elapsed < max_wait_seconds:
            time.sleep(check_interval)
            elapsed += check_interval
            
            # Refresh page to check for updates
            driver.refresh()
            time.sleep(2)
            
            # Check for order completed status
            page_text = driver.page_source.lower()
            page_title = driver.title.lower()
            
            # Check specifically for "order completed" or "order complete"
            order_completed = (
                "order completed" in page_text or 
                "order complete" in page_text or
                "ordercompleted" in page_text or
                "completed" in page_text and "order" in page_text
            )
            
            if order_completed:
                payment_confirmed = True
                print("Order completed detected! Looking for unseal button...", file=sys.stderr)
                break
            # Also check for other success indicators as fallback
            elif any(indicator in page_text for indicator in [
                "payment confirmed",
                "payment received",
                "gift card ready",
                "code available",
                "paid"
            ]):
                payment_confirmed = True
                print("Payment confirmed! Looking for unseal/reveal button...", file=sys.stderr)
                break
            else:
                print(f"Waiting for order completion... ({elapsed}s/{max_wait_seconds}s)", file=sys.stderr)
        
        if not payment_confirmed:
            result["error"] = "Order not completed within timeout period"
            result["message"] = f"Waited {max_wait_minutes} minutes but order was not completed"
            return result
        
        # Order completed - now look for and click unseal button
        print("Order completed! Looking for unseal button...", file=sys.stderr)
        time.sleep(3)  # Give page a moment to fully load
        
        unseal_element = None
        max_attempts = 3
        
        for attempt in range(max_attempts):
            print(f"Attempt {attempt + 1}/{max_attempts} to find unseal element...", file=sys.stderr)
            
            # Refresh page to ensure we have latest content
            if attempt > 0:
                driver.refresh()
                time.sleep(3)
            
            # Try different selectors for unseal element (prioritize span with "Click to unseal")
            unseal_selectors = [
                # Look for span with "Click to unseal" text (exact match first)
                (By.XPATH, "//span[normalize-space(text())='Click to unseal']"),
                (By.XPATH, "//span[contains(text(), 'Click to unseal')]"),
                (By.XPATH, "//span[contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'click to unseal')]"),
                (By.XPATH, "//span[contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'unseal')]"),
                # Look for elements with "peel" class (Bitrefill uses _peel-text_ class)
                (By.CSS_SELECTOR, "span._peel-text_1ynwf_169"),
                (By.CSS_SELECTOR, "span[class*='peel-text']"),
                (By.CSS_SELECTOR, "span[class*='peel']"),
                (By.CSS_SELECTOR, "[class*='peel-text']"),
                # Case-insensitive text matching for buttons/links
                (By.XPATH, "//button[contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'unseal')]"),
                (By.XPATH, "//a[contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'unseal')]"),
                (By.XPATH, "//*[contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'unseal')]"),
            ]
            
            for by, selector in unseal_selectors:
                try:
                    # Wait for element to be present
                    try:
                        elements = WebDriverWait(driver, 5).until(
                            EC.presence_of_all_elements_located((by, selector))
                        )
                    except TimeoutException:
                        elements = driver.find_elements(by, selector)
                    
                    for elem in elements:
                        try:
                            # Wait for element to be visible and check if it's displayed
                            WebDriverWait(driver, 3).until(EC.visibility_of(elem))
                            
                            if elem.is_displayed():
                                text = (elem.text or "").strip()
                                elem_id = elem.get_attribute("id") or ""
                                elem_class = elem.get_attribute("class") or ""
                                tag_name = elem.tag_name.lower()
                                
                                print(f"Found element: tag={tag_name}, text='{text}', class='{elem_class[:50]}'", file=sys.stderr)
                                
                                # If it's a span with "unseal" text, find its clickable parent
                                if tag_name == "span" and ("unseal" in text.lower() or "peel" in elem_class.lower()):
                                    print(f"Found unseal span! Text: '{text}', Class: '{elem_class}'. Looking for clickable parent...", file=sys.stderr)
                                    
                                    # Use JavaScript to find the clickable parent
                                    try:
                                        clickable_parent = driver.execute_script("""
                                            var span = arguments[0];
                                            var current = span.parentElement;
                                            var maxDepth = 10;
                                            var depth = 0;
                                            
                                            while (current && depth < maxDepth) {
                                                var style = window.getComputedStyle(current);
                                                var isVisible = style.display !== 'none' && 
                                                               style.visibility !== 'hidden' && 
                                                               style.opacity !== '0';
                                                
                                                if (isVisible) {
                                                    // Check if it's clickable
                                                    var hasClickHandler = current.onclick || 
                                                                         current.getAttribute('onclick') ||
                                                                         current.getAttribute('role') === 'button' ||
                                                                         current.style.cursor === 'pointer' ||
                                                                         current.classList.toString().toLowerCase().includes('click') ||
                                                                         current.classList.toString().toLowerCase().includes('button') ||
                                                                         current.classList.toString().toLowerCase().includes('cursor');
                                                    
                                                    if (hasClickHandler) {
                                                        return current;
                                                    }
                                                    
                                                    // Also check if it's a div/button/a that might be clickable
                                                    var tag = current.tagName.toLowerCase();
                                                    if (tag === 'button' || tag === 'a' || 
                                                        (tag === 'div' && (current.onclick || current.getAttribute('onclick')))) {
                                                        return current;
                                                    }
                                                }
                                                
                                                current = current.parentElement;
                                                depth++;
                                            }
                                            
                                            // If no clickable parent, return the span itself
                                            return span;
                                        """, elem)
                                        
                                        if clickable_parent:
                                            unseal_element = clickable_parent
                                            print(f"Found clickable parent! Tag: {clickable_parent.tag_name}, Will click this element.", file=sys.stderr)
                                            break
                                    except Exception as e:
                                        print(f"Error finding parent: {e}. Will try clicking span directly.", file=sys.stderr)
                                        unseal_element = elem
                                        break
                                    
                                    # If JavaScript didn't work, try XPath
                                    if not unseal_element:
                                        try:
                                            parent = elem.find_element(By.XPATH, "./ancestor::*[@onclick or @role='button' or contains(@class, 'click') or contains(@class, 'button') or contains(@class, 'cursor')][1]")
                                            if parent and parent.is_displayed():
                                                unseal_element = parent
                                                print(f"Found parent via XPath! Tag: {parent.tag_name}", file=sys.stderr)
                                                break
                                        except:
                                            # Fallback: click span directly
                                            unseal_element = elem
                                            print(f"Will click span directly.", file=sys.stderr)
                                            break
                                # For buttons/links with unseal text
                                elif "unseal" in text.lower() or "unseal" in elem_id.lower() or "unseal" in elem_class.lower():
                                    unseal_element = elem
                                    print(f"Found unseal element! Tag: {tag_name}, Text: '{text}'", file=sys.stderr)
                                    break
                        except Exception as e:
                            continue
                    
                    if unseal_element:
                        break
                except Exception as e:
                    print(f"Error with selector {selector}: {e}", file=sys.stderr)
                    continue
            
            # If still not found, try finding all spans with "unseal" and their parents
            if not unseal_element:
                try:
                    # Look for all spans with "unseal" text
                    all_spans = driver.find_elements(By.TAG_NAME, "span")
                    for span in all_spans:
                        try:
                            if span.is_displayed():
                                text = (span.text or "").strip().lower()
                                span_class = (span.get_attribute("class") or "").lower()
                                
                                if "unseal" in text or "peel" in span_class:
                                    # Use JavaScript to find clickable parent
                                    try:
                                        clickable_parent = driver.execute_script("""
                                            var span = arguments[0];
                                            var current = span.parentElement;
                                            var maxDepth = 10;
                                            var depth = 0;
                                            
                                            while (current && depth < maxDepth) {
                                                var style = window.getComputedStyle(current);
                                                var isVisible = style.display !== 'none' && style.visibility !== 'hidden';
                                                
                                                if (isVisible && (current.onclick || current.getAttribute('onclick') || 
                                                    current.getAttribute('role') === 'button' ||
                                                    current.classList.toString().toLowerCase().includes('click') ||
                                                    current.classList.toString().toLowerCase().includes('button'))) {
                                                    return current;
                                                }
                                                current = current.parentElement;
                                                depth++;
                                            }
                                            return span;
                                        """, span)
                                        
                                        if clickable_parent:
                                            unseal_element = clickable_parent
                                            print(f"Found unseal span via broad search! Using parent. Span text: '{span.text}'", file=sys.stderr)
                                            break
                                    except:
                                        unseal_element = span
                                        print(f"Found unseal span via broad search! Clicking span directly. Text: '{span.text}'", file=sys.stderr)
                                        break
                        except Exception:
                            continue
                    
                    # Also check buttons/links/clickables
                    if not unseal_element:
                        all_buttons = driver.find_elements(By.TAG_NAME, "button")
                        all_links = driver.find_elements(By.TAG_NAME, "a")
                        all_clickables = driver.find_elements(By.CSS_SELECTOR, "[onclick], [role='button'], [class*='cursor-pointer'], [class*='clickable']")
                        
                        for elem in all_buttons + all_links + all_clickables:
                            try:
                                if elem.is_displayed():
                                    text = (elem.text or "").strip().lower()
                                    elem_id = (elem.get_attribute("id") or "").lower()
                                    elem_class = (elem.get_attribute("class") or "").lower()
                                    onclick = (elem.get_attribute("onclick") or "").lower()
                                    
                                    if any("unseal" in s for s in [text, elem_id, elem_class, onclick]):
                                        unseal_element = elem
                                        print(f"Found unseal element via broad search! Text: '{elem.text}', Tag: {elem.tag_name}", file=sys.stderr)
                                        break
                                    elif not unseal_element and any(word in text for word in ["reveal", "show", "view", "unhide"]):
                                        unseal_element = elem
                                        print(f"Found reveal/show element via broad search. Text: '{elem.text}'", file=sys.stderr)
                            except Exception:
                                continue
                except Exception as e:
                    print(f"Error in broad search: {e}", file=sys.stderr)
            
            if unseal_element:
                break
            
            # If not found, wait a bit and try again
            if attempt < max_attempts - 1:
                print("Unseal element not found yet. Waiting 2 seconds and retrying...", file=sys.stderr)
                time.sleep(2)
        
        if unseal_element:
            print(f"Found unseal element! Attempting to click... (Tag: {unseal_element.tag_name}, Text: '{unseal_element.text}')", file=sys.stderr)
            try:
                # Scroll element into view
                driver.execute_script("arguments[0].scrollIntoView({behavior: 'smooth', block: 'center'});", unseal_element)
                time.sleep(1)
                
                # Wait for element to be clickable
                try:
                    WebDriverWait(driver, 5).until(EC.element_to_be_clickable(unseal_element))
                except:
                    pass  # Continue anyway
                
                # Try multiple click methods
                clicked = False
                
                # Method 1: JavaScript click (most reliable for spans)
                try:
                    driver.execute_script("arguments[0].click();", unseal_element)
                    clicked = True
                    print("✓ Clicked using JavaScript click()", file=sys.stderr)
                except Exception as e1:
                    print(f"JavaScript click failed: {e1}. Trying regular click...", file=sys.stderr)
                    
                    # Method 2: Regular click
                    try:
                        unseal_element.click()
                        clicked = True
                        print("✓ Clicked using regular click()", file=sys.stderr)
                    except Exception as e2:
                        print(f"Regular click failed: {e2}. Trying action chain...", file=sys.stderr)
                        
                        # Method 3: Action chain
                        try:
                            from selenium.webdriver.common.action_chains import ActionChains
                            actions = ActionChains(driver)
                            actions.move_to_element(unseal_element).click().perform()
                            clicked = True
                            print("✓ Clicked using ActionChains", file=sys.stderr)
                        except Exception as e3:
                            print(f"ActionChains click failed: {e3}. Trying mouse events...", file=sys.stderr)
                            
                            # Method 4: Simulate mouse events
                            try:
                                driver.execute_script("""
                                    var elem = arguments[0];
                                    var event = new MouseEvent('click', {
                                        view: window,
                                        bubbles: true,
                                        cancelable: true
                                    });
                                    elem.dispatchEvent(event);
                                """, unseal_element)
                                clicked = True
                                print("✓ Clicked using mouse event simulation", file=sys.stderr)
                            except Exception as e4:
                                print(f"Mouse event click failed: {e4}", file=sys.stderr)
                
                if clicked:
                    print("Unseal element clicked successfully! Waiting for code to appear...", file=sys.stderr)
                    time.sleep(5)  # Wait for code to appear
                    
                    # Refresh page to ensure code is visible
                    driver.refresh()
                    time.sleep(3)
                else:
                    print("⚠ Failed to click unseal element with all methods", file=sys.stderr)
            except Exception as e:
                print(f"Error clicking unseal element: {e}", file=sys.stderr)
        else:
            print("WARNING: No unseal element found after all attempts. Code might already be visible or page structure changed.", file=sys.stderr)
            print("Searching page source for 'unseal' or 'peel'...", file=sys.stderr)
            page_source_lower = driver.page_source.lower()
            if "unseal" in page_source_lower or "peel" in page_source_lower:
                print("Found 'unseal' or 'peel' in page source but couldn't locate element. Page source snippet:", file=sys.stderr)
                # Find the relevant section
                import re
                matches = re.findall(r'.{0,200}(?:unseal|peel).{0,200}', page_source_lower, re.IGNORECASE)
                for match in matches[:3]:
                    print(f"  ...{match}...", file=sys.stderr)
        
        # Now extract the gift card code
        gift_card_code = None
        
        # Try different selectors for gift card code
        code_selectors = [
            (By.CSS_SELECTOR, "[data-testid*='gift-card-code']"),
            (By.CSS_SELECTOR, "[data-testid*='code']"),
            (By.CSS_SELECTOR, ".gift-card-code"),
            (By.CSS_SELECTOR, ".code"),
            (By.CSS_SELECTOR, "code"),
            (By.CSS_SELECTOR, ".voucher-code"),
            (By.CSS_SELECTOR, ".redemption-code"),
            (By.XPATH, "//*[contains(@class, 'code') or contains(@class, 'gift-card')]"),
            (By.XPATH, "//*[contains(@class, 'voucher')]"),
        ]
        
        for by, selector in code_selectors:
            try:
                elements = driver.find_elements(by, selector)
                for elem in elements:
                    text = elem.text.strip()
                    # Gift card codes are typically alphanumeric, 10-20 chars
                    if text and len(text) >= 10 and len(text) <= 20:
                        # Check if it looks like a gift card code (alphanumeric, possibly with dashes)
                        if all(c.isalnum() or c in ['-', ' '] for c in text):
                            gift_card_code = text.replace(' ', '').replace('-', '')
                            break
                    # Also check for longer codes that might be split across lines
                    elif text and len(text) > 20:
                        # Try to extract code from longer text
                        import re
                        code_match = re.search(r'([A-Z0-9]{10,20})', text)
                        if code_match:
                            gift_card_code = code_match.group(1)
                            break
                if gift_card_code:
                    break
            except Exception:
                continue
        
        # Also check page source for code patterns
        if not gift_card_code:
            page_source = driver.page_source
            import re
            # Look for patterns like "code: ABC123..." or "gift card: XYZ..."
            patterns = [
                r'code[:\s]+([A-Z0-9]{10,20})',
                r'gift[-\s]?card[:\s]+([A-Z0-9]{10,20})',
                r'redemption[-\s]?code[:\s]+([A-Z0-9]{10,20})',
                r'voucher[-\s]?code[:\s]+([A-Z0-9]{10,20})',
                r'([A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4})',  # Format: XXXX-XXXX-XXXX-XXXX
                r'([A-Z0-9]{10,20})',  # Any alphanumeric string 10-20 chars
            ]
            for pattern in patterns:
                matches = re.findall(pattern, page_source, re.IGNORECASE)
                if matches:
                    # Take the longest match that looks like a code
                    potential_code = max(matches, key=len)
                    if len(potential_code) >= 10:
                        gift_card_code = potential_code.upper().replace('-', '')
                        break
        
        if gift_card_code:
            result["success"] = True
            result["gift_card_code"] = gift_card_code
            result["message"] = "Payment confirmed and gift card code extracted"
            print(f"Found gift card code: {gift_card_code}", file=sys.stderr)
        else:
            result["error"] = "Could not extract gift card code"
            result["message"] = "Payment confirmed but gift card code not found. Page may have changed structure."
            print("Payment confirmed but code not found. Page source snippet:", file=sys.stderr)
            print(driver.page_source[:2000], file=sys.stderr)
        
    except Exception as e:
        result["error"] = str(e)
        result["message"] = f"Error waiting for payment: {str(e)}"
        print(f"Error: {e}", file=sys.stderr)
    finally:
        if driver:
            driver.quit()
    
    return result

def main():
    """Main entry point."""
    if len(sys.argv) < 2:
        result = {
            "success": False,
            "error": "Missing action parameter",
            "message": "Usage: python3 bitrefill_payment_flow.py <action> [checkout_url]"
        }
        print(json.dumps(result))
        sys.exit(1)
    
    action = sys.argv[1]
    checkout_url = sys.argv[2] if len(sys.argv) > 2 else None
    
    if action == "scrape_address":
        if not checkout_url:
            result = {
                "success": False,
                "error": "Missing checkout URL",
                "message": "Please provide checkout URL"
            }
            print(json.dumps(result))
            sys.exit(1)
        
        result = scrape_payment_address(checkout_url)
        print(json.dumps(result))
        sys.exit(0 if result["success"] else 1)
    
    elif action == "wait_for_code":
        if not checkout_url:
            result = {
                "success": False,
                "error": "Missing checkout URL",
                "message": "Please provide checkout URL"
            }
            print(json.dumps(result))
            sys.exit(1)
        
        max_wait = int(os.getenv("MAX_WAIT_MINUTES", "10"))
        result = wait_for_payment_and_get_code(checkout_url, max_wait)
        print(json.dumps(result))
        sys.exit(0 if result["success"] else 1)
    
    else:
        result = {
            "success": False,
            "error": "Invalid action",
            "message": "Action must be 'scrape_address' or 'wait_for_code'"
        }
        print(json.dumps(result))
        sys.exit(1)

if __name__ == "__main__":
    main()

