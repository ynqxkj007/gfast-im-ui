//  format
export function formatDate(value, format= "YYYY-MM-DD HH:mm:ss") {
    if (!value) {
        return ''
    }

    const date = new Date(value);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();

    const pad = (n) => (n < 10 ? '0' + n : n);
    return format
        .replace('YYYY', year + "")
        .replace('MM', pad(month))
        .replace('DD', pad(day))
        .replace('HH', pad(hours))
        .replace('mm', pad(minutes))
        .replace('ss', pad(seconds));

   // return `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')} ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

}



export function isAfter(date1, date2) {
    return date1.getTime() > date2.getTime();
}

export function isBefore(date1, date2) {
    return date1.getTime() < date2.getTime();
}


export function isSameDay(date1, date2) {
    return date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate();
}


export function isSameMonth(date1, date2) {
    return date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth();
}

export function isSameYear(date1, date2) {
    return date1.getFullYear() === date2.getFullYear();
}

export function isSameHour(date1, date2) {
    return date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate() &&
        date1.getHours() === date2.getHours();
}
export function timeDifferenceInSeconds(date1, date2) {
    // 获取两个日期的时间戳（以毫秒为单位）
    const timestamp1 = date1.getTime();
    const timestamp2 = date2.getTime();

    // 计算时间差（以毫秒为单位）
    const difference = Math.abs(timestamp2 - timestamp1);

    // 返回时间差（以秒为单位）
    return difference / 1000;
}


export function shortTime(d) {
    if (!d) {
        return ""
    }
    const t = new Date(d)
    if (isSameDay(t, new Date())) {
        return formatDate(t, 'HH:mm')
    } else if (isSameMonth(t, new Date())) {
        return formatDate(t, 'MM-DD HH:mm')
    } else {
        return formatDate(t, 'YYYY-MM-DD HH:mm')
    }
}

export function isLocalTime(value) {
    return /^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})$/.test(value)
}



export function deepCopy (obj) {
    return JSON.parse(JSON.stringify(obj))
}


// 防抖
export function debounce(func, wait) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            func.apply(null, args);
        }, wait);
    };
}


export function buildImgUrl (url, baseUrl) {
    if (!url) {
        return ''
    }
    if (url.startsWith("http") || url.startsWith("https")) {
        return url
    }
    if (baseUrl.startsWith("http") || baseUrl.startsWith("https")) {
        return baseUrl + url
    } else {
        const u = new URL(window.location.href);
        const protocol = u.protocol;
        const domain = u.hostname;
        let port = u.port !== "" ? `:${u.port}` : "";
        return `${protocol}//${domain}${port}${baseUrl}${url}`
    }
}

export  function truncateString(str, maxLength) {
    if (!str || str.length <= maxLength) {
        return str;
    }

    return str.substring(0, maxLength - 3) + "...";
}