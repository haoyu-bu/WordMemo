import time, configparser
import schedule
from pymongo import *

def getConfig(section, item, config_name = 'config.ini'):
    config = configparser.RawConfigParser()
    config.read(config_name)
    return config.get(section, item)

def getConnection(section, configName = 'config.ini'):
    config = configparser.RawConfigParser()
    config.read(configName)
    host = config.get(section, 'db_host')
    port = config.get(section, 'db_port')
    name = config.get(section, 'db_name')
    return MongoClient(host, int(port))[name]

def refresh_database():
    print("refresh...")
    user_col = getConnection('mongo')['users']
    user_col.update({}, {'$set': {'todayWords': [], 'todayLearned': 0, 'todayMastered': 0}})
        
def main():
    schedule.every().day.at("00:00").do(refresh_database)
    while True:
        schedule.run_pending()
        time.sleep(1)

if __name__ == '__main__':
    main()
