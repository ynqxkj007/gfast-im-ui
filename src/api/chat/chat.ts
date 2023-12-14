import request from '/@/utils/request'


// 获取用户列表
export function getUserList(query:any) {
    return request({
        url: '/api/v1/chat/userList',
        method: 'get',
        params: query
    })
}


// 获取在线用户列表
export function getOnlineUserList() {
    return request({
        url: '/api/v1/chat/onlineUserList',
        method: 'get'
    })
}


// 获取历史聊天记录
export function getHistoryMessage(query:any) {
    return request({
        url: '/api/v1/chat/historyChat',
        method: 'get',
        params: query
    })
}

// 新增群聊成员
export function addGroupMember(data:any) {
    return request({
        url: '/api/v1/chat/addGroupMember',
        method: 'post',
        data
    })
}

// 新增房间
export function addRoom(query:any) {
    return request({
        url: '/api/v1/chat/createRoom',
        method: 'post',
        data: query
    })
}


// 获取房间列表
export function getRoomList(query:any) {
    return request({
        url: '/api/v1/chat/getRoomList',
        method: 'get',
        params: query
    })
}

// 修改群聊名称
export function updateRoomName(data:any) {
    return request({
        url: '/api/v1/chat/updateRoomName',
        method: 'post',
        data
    })
}

// 退出群聊
export function quitRoom(data:any) {
    return request({
        url: '/api/v1/chat/quitRoom',
        method: 'post',
        data
    })
}

// 更新群聊公告
export function updateRoomNotice(data:any) {
    return request({
        url: '/api/v1/chat/updateRoomNotice',
        method: 'post',
        data
    })
}

