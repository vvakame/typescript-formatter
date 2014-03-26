class Sample {
    hello(word= "world") { return "Hello, " + word; }
}

var s = new Sample();
if(s === s) { console.log(s.hello()); }
