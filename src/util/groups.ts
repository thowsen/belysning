const WHOLE_ROOM = [
  65540, 65541, 65542,
  65543, 65544, 65545,
  65546, 65547, 65553,
  65552, 65551, 65550,
  65549
]


const ODD_EVEN = {
    odd: [65545, 65542, 65541, 65546, 65539],
    even: [65544, 65543, 65540, 65547, 65548]
}

const LEFT_RIGHT = {
    left: [65545, 65544, 65542, 65547, 65539, 65548],
    right: [65542, 65543, 65541, 65540, 65546]
}

const indexToId = new Map()
indexToId.set(1, 65545)
indexToId.set(2, 65544)
indexToId.set(4, 65542)
indexToId.set(5, 65543)
indexToId.set(7, 65541)
indexToId.set(9, 65540)
indexToId.set(10, 65546)
indexToId.set(11, 65547)
indexToId.set(12, 65539)
indexToId.set(13, 65548)

module.exports = {
    WHOLE_ROOM,
    ODD_EVEN,
    LEFT_RIGHT,
    indexToId
}


//EXAMPLE: I want to light nine, id = 65540, 65540 - 65539 = 1 => index = 1
//INSTANCEID - 65539 = index
/*
       [ {'one'     : 65545},
         {'two'     : 65544},
         {'four'    : 65542},
         {'five'    : 65543},
         {'seven'   : 65541},
         {'nine'    : 65540}, 
         {'ten'     : 65546},
         {'eleven'  : 65547},
         {'twelve ' : 65539},
         {'thirteen': 65548} ]   */