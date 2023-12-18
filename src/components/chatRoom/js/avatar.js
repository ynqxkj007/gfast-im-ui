class Avatar {
    cache= {}
    constructor() {
    }
    create (imageUrls) {
        if (!imageUrls ||!imageUrls.length) {
            return Promise.reject('imageUrls is required')
        }
        return new Promise((resolve, reject) => {
            Promise.all(imageUrls.map(src => {
                return new Promise((resolve, reject)=> {
                    if (this.cache[src]) {
                        resolve(this.cache[src])
                        return
                    }
                    const img = new Image();
                    img.src = src;
                    img.crossOrigin = 'anonymous'
                    img.onload = () => {
                        this.cache[src] = img
                        resolve(img)
                    };
                    img.onerror = () => {
                        resolve(null)
                    };
                })
            })).then((avatars) => {
                resolve(this.#mergeAvatars(avatars.filter(avatar => avatar)))
            }).catch(reject)
        })
    }

    #mergeAvatars(avatars) {
        if (!avatars ||!avatars.length) {
            return ""
        }
        var fourSidedPixels = 134;
        const canvas = document.createElement("canvas")
        canvas.width = fourSidedPixels
        canvas.height = fourSidedPixels
        const ctx = canvas.getContext("2d")
        ctx.rect(0, 0, fourSidedPixels, fourSidedPixels);
        ctx.fillStyle = 'rgba(255, 255, 255, 0)';
        ctx.fill();
        var cwidth = this.#getWidth(avatars.length);
        var Xy = this.#getXy(avatars.length);
        for (let index = 0; index < Xy.length; index++) {
            var element = Xy[index];
            var sizeArr = element.split(',');
            var x = Number(sizeArr[0]);
            var y = Number(sizeArr[1]);
            ctx.drawImage(avatars[index], x, y, cwidth, cwidth);
        }
        return canvas.toDataURL("image/png")
    }


    #getWidth(size) {
        var width = 0;
        if (size === 1) {
            width = 120;
        }
        if (size > 1 && size <= 4) {
            width = 60;
        }
        if (size >= 5) {
            width = 40;
        }
        return width;
    }

    #getXy(size) {
        if (size === 0 || size > 9) {
            return null;
        }
        var s = new Array(size);
        //  String[] s = new String[size];
        var _x = 0;
        var _y = 0;
        if (size === 1) {
            _x = _y = 6;
            s[0] = "6,6";
        }
        if (size === 2) {
            _x = _y = 4;
            s[0] = "4," + (132 / 2 - 60 / 2);
            s[1] = 60 + 2 * _x + "," + (132 / 2 - 60 / 2);
        }
        if (size === 3) {
            _x = _y = 4;
            s[0] = (132 / 2 - 60 / 2) + "," + _y;
            s[1] = _x + "," + (60 + 2 * _y);
            s[2] = (60 + 2 * _y) + "," + (60 + 2 * _y);
        }
        if (size === 4) {
            _x = _y = 4;
            s[0] = _x + "," + _y;
            s[1] = (_x * 2 + 60) + "," + _y;
            s[2] = _x + "," + (60 + 2 * _y);
            s[3] = (60 + 2 * _y) + "," + (60 + 2 * _y);
        }
        if (size === 5) {
            _x = _y = 3;
            s[0] = (132 - 40 * 2 - _x) / 2 + "," + (132 - 40 * 2 - _y) / 2;
            s[1] = ((132 - 40 * 2 - _x) / 2 + 40 + _x) + "," + (132 - 40 * 2 - _y) / 2;
            s[2] = _x + "," + ((132 - 40 * 2 - _x) / 2 + 40 + _y);
            s[3] = (_x * 2 + 40) + "," + ((132 - 40 * 2 - _x) / 2 + 40 + _y);
            s[4] = (_x * 3 + 40 * 2) + "," + ((132 - 40 * 2 - _x) / 2 + 40 + _y);
        }
        if (size === 6) {
            _x = _y = 3;
            s[0] = _x + "," + ((132 - 40 * 2 - _x) / 2);
            s[1] = (_x * 2 + 40) + "," + ((132 - 40 * 2 - _x) / 2);
            s[2] = (_x * 3 + 40 * 2) + "," + ((132 - 40 * 2 - _x) / 2);
            s[3] = _x + "," + ((132 - 40 * 2 - _x) / 2 + 40 + _y);
            s[4] = (_x * 2 + 40) + "," + ((132 - 40 * 2 - _x) / 2 + 40 + _y);
            s[5] = (_x * 3 + 40 * 2) + "," + ((132 - 40 * 2 - _x) / 2 + 40 + _y);
        }
        if (size === 7) {
            _x = _y = 3;
            s[0] = (132 - 40) / 2 + "," + _y;
            s[1] = _x + "," + (_y * 2 + 40);
            s[2] = (_x * 2 + 40) + "," + (_y * 2 + 40);
            s[3] = (_x * 3 + 40 * 2) + "," + (_y * 2 + 40);
            s[4] = _x + "," + (_y * 3 + 40 * 2);
            s[5] = (_x * 2 + 40) + "," + (_y * 3 + 40 * 2);
            s[6] = (_x * 3 + 40 * 2) + "," + (_y * 3 + 40 * 2);
        }
        if (size === 8) {
            _x = _y = 3;
            s[0] = (132 - 80 - _x) / 2 + "," + _y;
            s[1] = ((132 - 80 - _x) / 2 + _x + 40) + "," + _y;
            s[2] = _x + "," + (_y * 2 + 40);
            s[3] = (_x * 2 + 40) + "," + (_y * 2 + 40);
            s[4] = (_x * 3 + 40 * 2) + "," + (_y * 2 + 40);
            s[5] = _x + "," + (_y * 3 + 40 * 2);
            s[6] = (_x * 2 + 40) + "," + (_y * 3 + 40 * 2);
            s[7] = (_x * 3 + 40 * 2) + "," + (_y * 3 + 40 * 2);
        }
        if (size === 9) {
            _x = _y = 3;
            s[0] = _x + "," + _y;
            s[1] = _x * 2 + 40 + "," + _y;
            s[2] = _x * 3 + 40 * 2 + "," + _y;
            s[3] = _x + "," + (_y * 2 + 40);
            s[4] = (_x * 2 + 40) + "," + (_y * 2 + 40);
            s[5] = (_x * 3 + 40 * 2) + "," + (_y * 2 + 40);
            s[6] = _x + "," + (_y * 3 + 40 * 2);
            s[7] = (_x * 2 + 40) + "," + (_y * 3 + 40 * 2);
            s[8] = (_x * 3 + 40 * 2) + "," + (_y * 3 + 40 * 2);
        }
        return s;
    }


    drawTextAvatar(text, width, height) {
        const canvas = document.createElement("canvas")
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext("2d")
        ctx.font = "bold 60px Arial"
        ctx.fillStyle = this.#randomColor()
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText(text, canvas.width / 2, canvas.height / 2)
        return canvas.toDataURL("image/png")
    }

    // 随机颜色
    #randomColor() {
        return 'rgb(' + Math.floor(Math.random() * 255) + ',' + Math.floor(Math.random() * 255) + ',' + Math.floor(Math.random() * 255) + ')';
    }
}

export default new Avatar