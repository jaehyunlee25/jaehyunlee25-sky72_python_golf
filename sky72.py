from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from datetime import datetime
import time

time.sleep(0)
print('== sky72 ==')
print('0 delayed')

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

# driver.implicitly_wait(15)

# timestamp = str(int(time.mktime(datetime.today().timetuple()))) + '450'
# driver.get('http://www.sky72.com/kr/reservation/real_step01_search.jsp')
# addr = 'http://www.sky72.com/kr/reservation/real_step02_search_datelist.jsp?' + timestamp + '&mode=&resTabno=1&flagcd2=7&holecd=2&daykind=&sort=date&wdate_2=&wcrs_2=&page_init=Y&gb=&wcrs_sel=&fromDate=2021%2F12%2F14&toDate=2022%2F01%2F13'
# print(addr)

print('1.0. javascript call')
f = open('crawler.js', 'r')
con = f.read()
f.close()
print(con)

print('2.0. selenium start')
while True:
    print('3.0. while start')
    driver.get('http://www.sky72.com/kr/reservation/real_step01_search.jsp')
    driver.implicitly_wait(3)
    driver.execute_script(con)
    print('4.0. while sleep 57')
    time.sleep(57)

""" result = driver.find_element(By.ID, 'dateListId1')
f = open('../result.json', 'w')
f.write(result.get_attribute('innerHTML'))
f.close() """

# driver.quit()
