export function formatDate(value = null) {
    if (!value) {
        return ''
    }
    if (typeof value ==='string' && isLocalTime(value)) {
        return value
    }
    const date = new Date(value);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    return `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')} ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
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