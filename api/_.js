export const _sPromise = () => new Promise(resolve => {
    setTimeout(() => {
        resolve({
            _: [{
                _: 1
            }]
        })
    }, 2000);
})

export const _2 = id => new Promise(resolve => {
    setTimeout(() => {
        resolve({ _: id })
    }, 2000);
})