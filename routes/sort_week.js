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
function sort_by_wins_then_losses(a,b) {
   if (a.losses==b.losses) { return sort_by_wins(a,b); }
   if (a.wins == b.wins && a.losses < b.losses) { return -1; }    
   if (a.wins == b.wins && a.losses > b.losses) { return 1; }   
   if (a.wins < b.wins && a.losses < b.losses) { return 1; }     
   if (a.wins < b.wins && a.losses > b.losses) { return 1; }     
   if (a.wins > b.wins && a.losses < b.losses) { return -1; }      
   if (a.wins > b.wins && a.losses > b.losses) { return -1; }      
   return null;
}
function sort_by_wins_then_losses_reverse(a,b) {
   if (a.losses==b.losses) { return sort_by_wins_reverse(a,b); }
   if (a.wins == b.wins && a.losses < b.losses) { return 1; }    
   if (a.wins == b.wins && a.losses > b.losses) { return -1; }   
   if (a.wins < b.wins && a.losses < b.losses) { return -1; }     
   if (a.wins < b.wins && a.losses > b.losses) { return -1; }     
   if (a.wins > b.wins && a.losses < b.losses) { return 1; }      
   if (a.wins > b.wins && a.losses > b.losses) { return 1; }      
   return null;
}

function get_player_index(data,player_id) {
    for (var i=0; i < data.length; i++) {
        if (data[i].player_id == player_id) {
            return i;
        }
    }
    return -1;
}

function assign_leaders_highest_value(leaders,data,property,value) {
   if (leaders == null) { return null; }
   var saved_values = null;
   if (leaders.hasOwnProperty('length') == false) {
      var index = get_player_index(data,leaders);
      saved_values = new Object();    
      saved_values[leaders] = data[index][property];
      data[index][property] = value;
   } else {
      saved_values = new Object();    
      for (var i=0; i < leaders.length; i++) {
         var index = get_player_index(data,leaders[i]);
         saved_values[leaders] = data[index][property];
         data[index][property] = value;
      }
   }
   return saved_values;
}

function restore_leaders_value(leaders,data,property,saved_values) {
   if (saved_values == null) {
      return;
   }
   for (var sv_property in saved_values) {
       var id = parseInt(sv_property);
       var index = get_player_index(data,id);
       data[index][property] = saved_values[sv_property];
   }
}

exports.sort_week_results_with_leaders = function(sort_by,data,leaders) {
   if (sort_by == "player") {
      data.sort(sort_by_player_ascending);
   } else if (sort_by == "player_reversed") {
      data.sort(sort_by_player_descending);
   } else if (sort_by == "wins") {
      var saved = assign_leaders_highest_value(leaders,data,"wins",11);
      data.sort(sort_by_wins_then_losses);
      restore_leaders_value(leaders,data,"wins",saved);
   } else if (sort_by == "wins_reversed") {
      var saved = assign_leaders_highest_value(leaders,data,"wins",11);
      data.sort(sort_by_wins_then_losses_reverse);
      restore_leaders_value(leaders,data,"wins",saved);
   } else if (sort_by == "losses") {
      var saved = assign_leaders_highest_value(leaders,data,"losses",-1);
      data.sort(sort_by_losses);
      restore_leaders_value(leaders,data,"losses",saved);
   } else if (sort_by == "losses_reversed") {
      var saved = assign_leaders_highest_value(leaders,data,"losses",-1);
      data.sort(sort_by_losses_reverse);
      restore_leaders_value(leaders,data,"losses",saved);
   } else if (sort_by == "projected") {
      var saved = assign_leaders_highest_value(leaders,data,"projected_wins",11);
      data.sort(sort_by_projected_wins);
      restore_leaders_value(leaders,data,"projected_wins",saved);
   } else if (sort_by == "projected_reversed") {
      var saved = assign_leaders_highest_value(leaders,data,"projected_wins",11);
      data.sort(sort_by_projected_wins_reverse);
      restore_leaders_value(leaders,data,"projected_wins",saved);
   } else if (sort_by == "possible") {
      var saved = assign_leaders_highest_value(leaders,data,"possible_wins",11);
      data.sort(sort_by_possible_wins);
      restore_leaders_value(leaders,data,"possible_wins",saved);
   } else if (sort_by == "possible_reversed") {
      var saved = assign_leaders_highest_value(leaders,data,"possible_wins",11);
      data.sort(sort_by_possible_wins_reverse);
      restore_leaders_value(leaders,data,"possible_wins",saved);
   }
}

exports.sort_week_results = function(sort_by,data) {
   exports.sort_week_results_with_leaders(sort_by,data,null);
}

