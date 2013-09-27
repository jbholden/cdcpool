function sort_by_player_ascending(a,b) {
   if (a.player_name==b.player_name) { return 0; }
   return a.player_name < b.player_name? -1 : 1;
}
function sort_by_player_descending(a,b) {
   if (a.player_name==b.player_name) { return 0; }
   return a.player_name < b.player_name? 1 : -1;
}
function sort_by_wins(a,b) {
   if (a.wins==b.wins) { return 0; }
   return a.wins < b.wins? 1 : -1;
}
function sort_by_wins_reverse(a,b) {
   if (a.wins==b.wins) { return 0; }
   return a.wins < b.wins? -1 : 1;
}
function sort_by_losses(a,b) {
   if (a.losses==b.losses) { return 0; }
   return a.losses < b.losses? 1 : -1;
}
function sort_by_losses_reverse(a,b) {
   if (a.losses==b.losses) { return 0; }
   return a.losses < b.losses? -1 : 1;
}
function sort_by_projected_wins(a,b) {
   if (a.projected_wins==b.projected_wins) { return 0; }
   return a.projected_wins < b.projected_wins? 1 : -1;
}
function sort_by_projected_wins_reverse(a,b) {
   if (a.projected_wins==b.projected_wins) { return 0; }
   return a.projected_wins < b.projected_wins? -1 : 1;
}
function sort_by_possible_wins(a,b) {
   if (a.possible_wins==b.possible_wins) { return 0; }
   return a.possible_wins < b.possible_wins? 1 : -1;
}
function sort_by_possible_wins_reverse(a,b) {
   if (a.possible_wins==b.possible_wins) { return 0; }
   return a.possible_wins < b.possible_wins? -1 : 1;
}

exports.sort_week_results = function(sort_by,data) {
   if (sort_by == "player") {
      data.sort(sort_by_player_ascending);
   } else if (sort_by == "player_reversed") {
      data.sort(sort_by_player_descending);
   } else if (sort_by == "wins") {
      data.sort(sort_by_wins);
   } else if (sort_by == "wins_reversed") {
      data.sort(sort_by_wins_reverse);
   } else if (sort_by == "losses") {
      data.sort(sort_by_losses);
   } else if (sort_by == "losses_reversed") {
      data.sort(sort_by_losses_reverse);
   } else if (sort_by == "projected") {
      data.sort(sort_by_projected_wins);
   } else if (sort_by == "projected_reversed") {
      data.sort(sort_by_projected_wins_reverse);
   } else if (sort_by == "possible") {
      data.sort(sort_by_possible_wins);
   } else if (sort_by == "possible_reversed") {
      data.sort(sort_by_possible_wins_reverse);
   }
}
