from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from datetime import datetime
import time

time.sleep(0)
print('\n\n\n\n\n\n== players ==')
print('3 delayed')

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
l = open('players_login.js', 'r')
lcon = l.read()
l.close()

# 특이하게 로그인으로 바로 들어가면 안 되고, 이렇게 로그인을 유도하면 잘 된다.
# 이유는 알 수 없다.
driver.get('https://www.playersgc.com/03/02.asp')
alert = WebDriverWait(driver, 10).until(expected_conditions.alert_is_present())
print(alert.text)
alert.accept()

# 로그인 페이지로 자동 이동
# 로그인 스크립트 실행
driver.execute_script(lcon)

alert = WebDriverWait(driver, 10).until(expected_conditions.alert_is_present())
print(alert.text)
alert.accept()

f = open('common.js', 'r')
common = f.read()
f.close()

f = open('players.js', 'r')
con = f.read()
f.close()

con += common

print('2.0. selenium start')
while True:
    print('\n\n== players ==')
    print('3.0. while start')
    driver.get('https://www.playersgc.com/03/02.asp')
    time.sleep(1)
    driver.execute_script(con)

    print('4.0. while sleep 57')
    time.sleep(57)

# driver.quit()
