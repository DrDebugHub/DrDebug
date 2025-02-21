function init() {
    let i = 0;
    setInterval(() => {
        console.log("Test: " + (i++));
        if(i > 10) {
            throw new Error("Crashed");
        }
    }, 1000);
}

init();