from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from datetime import datetime
import time

# time.sleep(23)
print('\n\n\n\n\n\n== jinyang_valley ==')
print('23 delayed')

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
l = open('jinyang_login.js', 'r')
lcon = l.read()
l.close()

driver.get('https://www.chinyangvalley.co.kr/member/login.asp')
driver.implicitly_wait(3)
driver.execute_script(lcon)
time.sleep(5)

try:
    result = driver.switch_to_alert()
    print(result.text)
    result.accept()
    result.dismiss()
except:
    'There is no alert'

f = open('common.js', 'r')
common = f.read()
f.close()

f = open('jinyang.js', 'r')
con = f.read()
f.close()

con += common

print('2.0. selenium start')
while True:
    print('\n\n\n\n\n\n== jinyang_valley ==')
    print('3.0. while start')
    driver.get('https://www.chinyangvalley.co.kr/reservation/reservation.asp')
    driver.implicitly_wait(3)
    driver.execute_script(con)

    print('4.0. while sleep 57')
    time.sleep(57)
