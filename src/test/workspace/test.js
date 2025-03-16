function init() {
    let i = 0;
    let interval = setInterval(() => {
        console.log("Test: " + (i++));
        if(i > 5) {
            clearInterval(interval);
        }
    }, 1000);
}

init();