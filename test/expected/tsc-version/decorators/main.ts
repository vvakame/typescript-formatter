"use strict";

@classDecorator
class Sample {
    a(): string {
        return "";
    }

    @methodDecorator
    b(): string {
        return "";
    }

    @staticMethodDecorator
    static c(): string {
        return "";
    }

    @propertyDecorator
    d = "";


    @accessorDecorator
    get e(): string {
        return "";
    }

    f( @parameterDecorator str: string): string {
        return `Hello, ${str}`;
    }
}

console.log("------");

let obj = new Sample();
console.log(obj.a());
console.log(obj.b());
console.log(Sample.c());
console.log(obj.d);
console.log(obj.e);
console.log(obj.f("parameter"));

function classDecorator(sampleClazz: typeof Sample): typeof Sample {
    console.log("classDecorator", arguments);
    sampleClazz.prototype.a = function() {
        return "Hello from classDecorator!";
    }
    return null;
}

function methodDecorator(prototypeOfSample: any, key: string, propertyDescription: PropertyDescriptor): PropertyDescriptor {
    console.log("methodDecorator", arguments);
    return null;
}

function staticMethodDecorator(sampleClazz: typeof Sample, key: string, propertyDescription: PropertyDescriptor): PropertyDescriptor {
    console.log("staticMethodDecorator", arguments);
    return null;
}

function propertyDecorator(prototypeOfSample: any, key: string): void {
    console.log("propertyDecorator", arguments);
}

function accessorDecorator(prototypeOfSample: any, key: string, propertyDescription: PropertyDescriptor): PropertyDescriptor {
    console.log("accessorDecorator", arguments);
    return null;
}

function parameterDecorator(prototypeOfSample: any, methodName: string, parameterIndex: number): void {
    console.log("parameterDecorator", arguments);
}
