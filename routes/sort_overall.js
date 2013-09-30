function sort_by_player_ascending(a,b) {
   if (a.player_name==b.player_name) { return 0; }
   return a.player_name < b.player_name? -1 : 1;
}
function sort_by_player_descending(a,b) {
   if (a.player_name==b.player_name) { return 0; }
   return a.player_name < b.player_name? 1 : -1;
}

function sort_by_overall(a,b) {
   if (a.overall==b.overall) { return 0; }
   return a.overall < b.overall? 1 : -1;
}
function sort_by_overall_reverse(a,b) {
   if (a.overall==b.overall) { return 0; }
   return a.overall < b.overall? -1 : 1;
}
function sort_by_projected(a,b) {
   if (a.projected==b.projected) { return 0; }
   return a.projected < b.projected? 1 : -1;
}
function sort_by_projected_reverse(a,b) {
   if (a.projected==b.projected) { return 0; }
   return a.projected < b.projected? -1 : 1;
}
function sort_by_possible(a,b) {
   if (a.possible==b.possible) { return 0; }
   return a.possible < b.possible? 1 : -1;
}
function sort_by_possible_reverse(a,b) {
   if (a.possible==b.possible) { return 0; }
   return a.possible < b.possible? -1 : 1;
}


exports.sort_overall_results = function(sort_by,data) {
   if (sort_by == "player") {
      data.sort(sort_by_player_ascending);
   } else if (sort_by == "player_reversed") {
      data.sort(sort_by_player_descending);
   } else if (sort_by == "overall") {
      data.sort(sort_by_overall);
   } else if (sort_by == "overall_reversed") {
      data.sort(sort_by_overall_reverse);
   } else if (sort_by == "projected") {
      data.sort(sort_by_projected);
   } else if (sort_by == "projected_reversed") {
      data.sort(sort_by_projected_reverse);
   } else if (sort_by == "possible") {
      data.sort(sort_by_possible);
   } else if (sort_by == "possible_reversed") {
      data.sort(sort_by_possible_reverse);
   }
}
