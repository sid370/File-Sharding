function xor(part1, part2) {
  var result = "";
  for (var i = 0; i < 64; i++) {
    result =
      result + (parseInt(part1[i], 16) ^ parseInt(part2[i], 16)).toString(16);
  }
  //console.log (result," : ",result.length)
  return result;
}

randomisation = (uuid) => {
  //console.log(uuid)
  //console.log()
  var result = "";
  result = uuid.substring(0, 64);
  start = 64;
  end = 128;
  for (var i = 0; i < 2; i++) {
    part1 = result.substring(start - 64, end - 64);
    part2 = uuid.substring(start, end);
    var xorval = xor(part1, part2);
    //print ("Xoring ",part1," and ",part2," : ",xorval)
    result = result + xorval;
    start = start + 64;
    end = end + 64;
  }
  return result;
};

derandomisation = (uuid) => {
  var result = "";
  result = uuid.substring(0, 64);
  start = 64;
  end = 128;
  for (var i = 0; i < 2; i++) {
    part1 = uuid.substring(start - 64, end - 64);
    part2 = uuid.substring(start, end);
    var xorval = xor(part1, part2);
    //print ("Xoring ",part1," and ",part2," : ",xorval)
    result = result + xorval;
    start = start + 64;
    end = end + 64;
  }
  return result;
};

module.exports={
    randomisation,
    derandomisation
}