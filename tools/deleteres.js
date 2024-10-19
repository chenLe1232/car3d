var fs = require ("fs")

var path = 'build/wechatgame/res'

var includesFiles = [
    "res/raw-assets/14/14e864d4e.c1a23.png",
    "res/raw-assets/11/11aa46fea.ac454.png",
    "res/raw-assets/18/18d334441.8cb3d.png",
    "res/raw-assets/16/162f26dd6.44dad.png",
    "res/raw-assets/13/1377398a1.546e9.png",
]

var excludesFiles = [
    "res/raw-assets/16/860d114a-55dc-4a23-ac09-bced34e5f094.69e89.mp3",
    "res/raw-assets/2f/2f866cdb-b059-4aff-a069-2a6d5e8b1fa5.85bc9.mp3"
]

var includeExts = [
    ".mp3"
]

// 删除文件 
// fs.unlinkSync(xx,)


function readDirSync(path){
	var pa = fs.readdirSync(path);
	pa.forEach(function(ele,index){
		var info = fs.statSync(path+"/"+ele)	
		if(info.isDirectory()){
			// console.log("dir: "+ele)
			readDirSync(path+"/"+ele);
		}else{
            let filepath = (`${path}/${ele}`)
            if(includesFiles.some(v=>filepath.endsWith(v))){
                console.log("exclude file:" + filepath)
            }else{
                if(includeExts.some(v=>filepath.endsWith(v))){
                    if(excludesFiles.some(v=>filepath.endsWith(v))){
                        fs.unlinkSync(filepath);
                    }else
                        console.log("exclude exntension:" + filepath)
                }else{
                    fs.unlinkSync(filepath);
                }
            }
		}	
	})
}

readDirSync(path);