function init() {
    let i = 0;
    setInterval(() => {
        console.log("Test: " + (i++));
        if(i > 100) {
            throw new Error("Crashed");
        }
    }, 1000);
}

init();