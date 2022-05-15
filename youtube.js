const { async } = require("regenerator-runtime");
const url='https://www.youtube.com/playlist?list=PL-Jc9J83PIiEeD3I4VXETPDmzJ3Z1rWb4'
let page
const puppeteer=require("puppeteer");
const path=require("path")
const xlsx=require("xlsx");
let fs=require("fs");
let pdf=require("pdfkit");

(async function(){

    try {

        let browserOpen=await puppeteer.launch({
            headless:false,
            defaultViewport:null,
            args:['--start-maximized']

        })
        page=await browserOpen.newPage()
        await page.goto(url)
        await page.waitForSelector('h1[id="title"] a')
        let name=await page.evaluate(function(select){return document.querySelector(select).innerText},'h1[id="title"] a')
        let rodata=await page.evaluate(getPlaylistInfo,'div[id="stats"] .style-scope.ytd-playlist-sidebar-primary-info-renderer')
        let totalVideos=rodata.numbervid.split(" ")[0]

        let currVidLength=await getCVideoL()

        let lastthumb= await page.$$('span[id="text"].style-scope.ytd-thumbnail-overlay-time-status-renderer').length
        while(lastthumb!=totalVideos){
            await keepScrolling()
            lastthumb= await lastthumbreach()
            
        }
       
       let allVidStats=await getStats()

       let pdfdoc=new pdf
       pdfdoc.pipe(fs.createWriteStream("Analyze.pdf"))
       pdfdoc.text(JSON.stringify(allVidStats))
       pdfdoc.end()

       


    browserOpen.close()
    } catch (error) {
        console.log(error)
        
    }
})()


async function lastthumbreach(){
    let pos=await page.evaluate(end)
    return pos
}

function end(){
    let thumb = document.querySelectorAll('span[id="text"].style-scope.ytd-thumbnail-overlay-time-status-renderer')
    return thumb.length


}

async function keepScrolling(){
    await page.evaluate(goTObottom)
    function goTObottom(){
        window.scrollBy(0,window.innerHeight)
    }
}
//'div[id="stats"] .style-scope.ytd-playlist-sidebar-primary-info-renderer'
function getPlaylistInfo(selector){
    let eleArr=document.querySelectorAll(selector)
    let numbervid=eleArr[0].innerText
    let numberview=eleArr[1].innerText

    return {
        numbervid,
        numberview
    }


}

async function getCVideoL(){
    let length=await page.evaluate(getLength,'div[id="index-container"] yt-formatted-string[id="index"]')
    return length
}


async function getStats(){
    let statsObj=await page.evaluate(getVidData)
    return statsObj
}

//div[id="index-container"] yt-formatted-string[id="index"]
function getLength(durSelect){
    let durationvid=document.querySelectorAll(durSelect)
    return durationvid.length
}


function getVidData(){
    
    let videoEle = document.querySelectorAll('h3.style-scope.ytd-playlist-video-renderer')
    let durationEle = document.querySelectorAll('span[id="text"].style-scope.ytd-thumbnail-overlay-time-status-renderer')

    console.log(videoEle.length,' ',durationEle.length)
    let stats=[]

   for(let i=0;i<durationEle.length;i++){
        let videoname= videoEle[i].innerText
        let duration= durationEle[i].innerText

        stats.push({
            videoname,
            duration
        })

    }
    return stats

}