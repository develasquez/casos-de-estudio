let getRandomMetric = require("./IoT/getRandomMetric").getRandomMetric;
let randomData =[];

for (i=0;i<90000;i++){
    randomData.push(getRandomMetric());   
}

console.log(JSON.stringify(randomData));


