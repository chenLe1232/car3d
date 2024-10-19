#!/usr/bin/env python
#-*-coding:utf-8-*-

import os

build_path = os.path.join(os.getcwd(), "../build")
pngquant = ".\\pngquant\\pngquant.exe"
quality = "30-60"

def compress_png(path):
	cmd = "%s --force --ext .png --quality %s %s" % (pngquant, quality, path)
	print("command: %s" % cmd)
	os.system(cmd)
	
def main():
	print("build path: %s" % build_path)
	for dir, dirlist, files in os.walk(build_path):
		for file in files: 
			items = os.path.splitext(file)
			if items[1] != ".png": continue
			compress_png(dir + "/*.png")
			break
	os.system("pause")

if __name__ == "__main__":
	main()