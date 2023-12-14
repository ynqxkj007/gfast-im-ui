import {isAfter, isBefore, timeDifferenceInSeconds} from "../../js/utils"

class NoticeTime {
    timeList =  new Map()
    checkInterval(contactMark, time,  interval = 3600) {
        if (!time) {
            return false
        }
        this.timeList.has(contactMark) || this.timeList.set(contactMark, [])
        const tempTimeList = this.timeList.get(contactMark)
        //console.log(contactMark, time, tempTimeList)
        const t = new Date(time)
        if (tempTimeList.length  > 0 ) {
            const firstTime = tempTimeList[0]
            const lastTime = tempTimeList[tempTimeList.length - 1]
            if (isBefore(t, firstTime) && timeDifferenceInSeconds(t, firstTime) > interval) {
                tempTimeList.unshift(t);
                return true
            } else if (isAfter(t, lastTime) && timeDifferenceInSeconds(t, lastTime) > interval) {
                tempTimeList.push(t);
                return true;
            } else {
                return false;
            }
        } else {
            tempTimeList.push(t)
            return true
        }
    }

}


export default new NoticeTime();