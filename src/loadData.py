from pymongo import *
import json, configparser

def getConnection(section, configName = 'config.ini'):
    config = configparser.RawConfigParser()
    config.read(configName)
    host = config.get(section, 'db_host')
    port = config.get(section, 'db_port')
    name = config.get(section, 'db_name')
    return MongoClient(host, int(port))[name]

def getJSON(fname):
    f = open(fname, encoding='utf-8')
    result = json.load(f)
    return result

if __name__ == '__main__':
    result_words = getJSON("word.json")
    result_books = getJSON("book.json")
    collection = getConnection('mongo')['words']
    collection.create_index('word', unique=True)
    collection.insert(result_words)
    collection = getConnection('mongo')['books']
    collection.create_index('name', unique=True)
    collection.insert(result_books)