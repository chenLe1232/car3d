#read appids.txt
#write 
#!/usr/bin/env python
#-*-coding:utf-8-*-
import os
import json

build_game_json_path = os.path.join(os.getcwd(), "../build/wechatgame/game.json")
#//navigateToMiniProgramAppIdList

file = open(build_game_json_path)
a = json.load(file)
file.close()
if(("navigateToMiniProgramAppIdList") not in a):
    idlist = []
    a["navigateToMiniProgramAppIdList"] = idlist
else:
    idlist = a["navigateToMiniProgramAppIdList"]
    del idlist[:]

file_txt = open("appids.txt")

for line in file_txt.readlines():
    line = line.replace("\n","")
    line = line.replace(" ","")
    idlist.append(line)

json.dump(a,open(build_game_json_path,"w"),indent=4)


