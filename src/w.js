function conv(line) {
    let dimensions = {};
    let d = ['width', 'height'];
    line.split(",")[1].split('x').forEach((val, index) => { dimensions[d[index]] = parseInt(val); });
    let syms = ['[', ']', '{', '}'];
    let arr = line;
    let indexes = [];
    syms.forEach(sym => {
        arr = arr.split(sym).join(",");
    })
    //console.log("ARR", arr);
    arr = arr.split(",").filter(a => { return !!a; });
    //console.log("ARR 2", arr);
    arr.forEach((a, index) => {
            if (index + 3 >= arr.length) return;
            if (a.indexOf('x') > 0) {
                let n = arr[index + 3];
                if (!isNaN(n)) indexes.push(index);
            }
        });
    let panes = indexes.map(i => {
        let dim = arr[i].split('x');
        return { width: parseInt(dim[0]), height: parseInt(dim[1]), left: parseInt(arr[i + 1]), top: parseInt(arr[i + 2]), id: `%${arr[i + 3]}` };
    })
    return { dimensions, panes };
}

let l = "e52b,159x23,0,0{80x23,0,0,0,78x23,81,0,2}";
console.log(conv(l))

l = "9929,282x30,0,0[282x17,0,0,91,282x12,0,18,68]";
console.log(conv(l));