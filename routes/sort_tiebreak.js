function sort_by_tiebreak(a,b) {
   if (a.number_of_tiebreaks < b.number_of_tiebreaks) {
      return 1;
   }
   if (a.number_of_tiebreaks > b.number_of_tiebreaks) {
      return -1;
   }
   if (a.number_of_tiebreaks==b.number_of_tiebreaks) { 
      if (a.number_of_tiebreaks == 4) {
         if (a.tiebreak3 == b.tiebreak3) { return 0; }
         if (a.tiebreak3 == "won") { return -1; }
         if (a.tiebreak3 == "ahead") { return -1; }
         if (a.tiebreak3 == "lost") { return 1; }
         if (a.tiebreak3 == "behind") { return 1; }
      } else if (a.number_of_tiebreaks == 3) {
         if (a.tiebreak2 == b.tiebreak2) { return 0; }
         if (a.tiebreak2 == "won") { return -1; }
         if (a.tiebreak2 == "ahead") { return -1; }
         if (a.tiebreak2 == "lost") { return 1; }
         if (a.tiebreak2 == "behind") { return 1; }
      } else if (a.number_of_tiebreaks == 2) {
         if (a.tiebreak1 == b.tiebreak1) { return 0; }
         if (a.tiebreak1 == "won") { return -1; }
         if (a.tiebreak1 == "ahead") { return -1; }
         if (a.tiebreak1 == "lost") { return 1; }
         if (a.tiebreak1 == "behind") { return 1; }
      } else if (a.number_of_tiebreaks == 1) {
         if (a.tiebreak0 == b.tiebreak0) { return 0; }
         if (a.tiebreak0 == "won") { return -1; }
         if (a.tiebreak0 == "ahead") { return -1; }
         if (a.tiebreak0 == "lost") { return 1; }
         if (a.tiebreak0 == "behind") { return 1; }
      } else if (a.number_of_tiebreaks == 0) {
         return 0;
      } else {
         return 0;
      }
   }

}

function sort_by_difference(a,b) {
   if (a.difference==b.difference) { return 0; }
   return a.difference < b.difference? -1 : 1;
}

exports.sort_tiebreak = function(data) {
   data.sort(sort_by_tiebreak);
}
exports.sort_tiebreak1 = function(data) {
   data.sort(sort_by_difference);
}
exports.sort_tiebreak2 = function(data) {
   data.sort(sort_by_difference);
}
