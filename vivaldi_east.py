from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from datetime import datetime
import time

time.sleep(0)
print('\n\n\n\n\n\n== vivaldi_east ==')

print('step 1')
chrome_options = webdriver.ChromeOptions()
chrome_options.add_argument('headless')
chrome_options.add_argument('window-size=1920x1080')
chrome_options.add_argument('disable-gpu')
chrome_options.add_argument('--no-sandbox')
chrome_options.add_argument("--disable-web-security")
chrome_options.add_argument("--disable-site-isolation-trials")
chrome_options.add_argument("--disable-dev-shm-usage")

print('step 2')
driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=chrome_options)

print('1.0. javascript call')
l = open('vivaldi_east_login.js', 'r')
lcon = l.read()
l.close()

driver.get('https://www.sonofelicecc.com/login.dp')
driver.execute_script(lcon)
time.sleep(2)

f = open('common.js', 'r')
common = f.read()
f.close()

f = open('vivaldi_east.js', 'r')
con = f.read()
f.close()

con += common

print('2.0. selenium start')
while True:
    print('\n\n== vivaldi_east ==')
    print('3.0. while start')
    driver.get('https://www.sonofelicecc.com/rsv.cal.dp/dmparse.dm?fJiyukCd=60')
    time.sleep(1)
    driver.execute_script(con)
    time.sleep(5)
    driver.get('https://www.sonofelicecc.com/logout.dp/dmparse.dm')
    time.sleep(3)
    print('logout 되었습니다.')

    print('4.0. while sleep 57')
    time.sleep(57)

# driver.quit()
