export function extend(target) {
  for (var
    hOP = Object.prototype.hasOwnProperty,
    copy = function (key) {
      if (!hOP.call(target, key)) {
        Object.defineProperty(
          target,
          key,
          Object.getOwnPropertyDescriptor(this, key)
        );
      }
    },
    i = arguments.length;
    1 < i--;
    Object.keys(arguments[i]).forEach(copy, arguments[i])
  ){}
  return target;
}

// masks source1 with source2, result will be all of the properties in source1
// with values replaced from source2 if it contains the property
// if _static: [property keys] is provided, then properties in source2 that are in _static
// will not be included
export function mask(source1, source2, excludeProtect) {
    var destination = {};
    var _static = [];

    for (var property in source1) {
        if (source1.hasOwnProperty(property)) {
            if (property === "_static") {
                _static = source1[property];
                if (!excludeProtect) {
                    destination[property] = _static.slice(); // make a copy
                }
            } else {
                destination[property] = source1[property];
            }
        }
    }

    for (var property in source2) {
        if (source1.hasOwnProperty(property) && source2.hasOwnProperty(property) && _static.indexOf(property) === -1 && property != "_protect") { // Changed from extend here (2 => 1)
            destination[property] = source2[property];
        }
    }

    return destination;
}
