
var myData = require("./data");

module.exports = {
    getWKTData: (titleNumber, offset = 0, limit = 9)=> {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve({ data: myData.data[titleNumber] });
            }, 300);
        });
    }
};
