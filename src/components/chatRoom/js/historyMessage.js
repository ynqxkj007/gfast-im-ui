class HistoryMessage {
    msgList = new Map()

    getMsgList (uid) {
        if (this.msgList.has(uid)) {
            return this.msgList.get(uid)
        }
        return []
    }

    addMsgList (uid, content) {
        this.msgList.has(uid) || this.msgList.set(uid, [])
        const msgList = this.msgList.get(uid)
        msgList.push(content)
        if (msgList.length > 512) {
            msgList.splice(0, 64)
        }
    }

    clearMessage(uid) {
        if (this.msgList.has(uid)) {
            this.msgList.set(uid, [])
        }
    }

    // 头部添加数据
    unshiftMessage(uid, data) {
        if (!(Array.isArray(data) && data.length > 0)) {
            return 0
        }
        this.msgList.has(uid) || this.msgList.set(uid, [])
        const msgList = this.msgList.get(uid)
        msgList.unshift(...data)
        return data.length
    }

    // 弹出所有数据
    popAllMessage(uid) {
        if (this.msgList.has(uid)) {
            const result = this.msgList.get(uid)
            this.msgList.set(uid, [])
            return result
        }
        return []
    }
}


export default new HistoryMessage()