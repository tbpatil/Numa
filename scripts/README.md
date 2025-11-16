# Amazon Gift Card Redemption Automation

This directory contains the Python Selenium script for automating Amazon gift card redemption.

## Setup

### 1. Install Python Dependencies

```bash
pip install -r requirements.txt
```

Or if using a virtual environment:

```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Install ChromeDriver

The script uses `webdriver-manager` which will automatically download ChromeDriver. Alternatively, you can install it manually:

- Download from: https://chromedriver.chromium.org/
- Or use Homebrew on macOS: `brew install chromedriver`

### 3. Configure Gift Card Code

Edit `redeem_amazon_gift_card.py` and update the `GIFT_CARD_CODE` variable:

```python
GIFT_CARD_CODE = "YOUR_ACTUAL_GIFT_CARD_CODE_HERE"
```

### 4. Chrome Profile Setup

The script uses your saved Chrome browser session. By default, it uses:
- macOS: `~/Library/Application Support/Google/Chrome/Default`

To use a different profile, set environment variables:
- `CHROME_USER_DATA_DIR`: Path to Chrome user data directory
- `CHROME_PROFILE`: Profile name (default: "Default")

Example:
```bash
export CHROME_USER_DATA_DIR="/path/to/chrome/user/data"
export CHROME_PROFILE="Profile 1"
```

**Important**: Make sure you're logged into Amazon in the Chrome profile you're using, otherwise the script will fail.

### 5. Environment Variables (Optional)

- `HEADLESS`: Set to "false" to see the browser (default: "true")
- `SAVE_SCREENSHOT`: Set to "true" to save a screenshot after redemption (default: "false")
- `PYTHON_COMMAND`: Python command to use (default: "python3")

## Usage

### Direct Python Usage

```bash
python3 scripts/redeem_amazon_gift_card.py [GIFT_CARD_CODE]
```

If no code is provided, it uses the hardcoded value in the script.

### Via Next.js API

The script is automatically called by the Next.js API endpoint at `/api/redeem-gift-card` when you click the "Redeem Gift Card" button in the UI.

## Troubleshooting

1. **"Not signed in to Amazon"**: Make sure you're logged into Amazon in your Chrome profile
2. **"Could not find gift card code input field"**: Amazon may have changed their page structure. Check the script's selectors.
3. **ChromeDriver issues**: Make sure ChromeDriver version matches your Chrome version
4. **Permission errors**: Make sure the script has execute permissions: `chmod +x scripts/redeem_amazon_gift_card.py`

## Notes

- The script runs in headless mode by default (no visible browser)
- Set `HEADLESS=false` to see what's happening during redemption
- Screenshots can be saved for debugging by setting `SAVE_SCREENSHOT=true`

