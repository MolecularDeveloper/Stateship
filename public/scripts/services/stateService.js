(function() {
    "use-strict";
    angular
        .module('stateship')
        .service('StateService', stateService);

    function stateService($http, $q) {
        var national = ['', ''];
        var stateReps = [];
        var local = [];
        this.getRepsByState = getRepsByState;
        this.getRepArrays = getRepArrays;

        function getRepsByState(state, address) {
            return $http.post('/api/representatives', {
                address: address || state
            }).then(function(response) {

            	//separates out information
            	//national: US President, Vice President, Senators, US Rep
            	//state: Governor, Attorney General, State Legislators, etc
            	//local: County and City government
                var arr = response.data;
                national = ['', ''];
                stateReps = [];
                local = [];
                for (var i = 0; i < arr.length; i++) {
                    if (arr[i].office.levels &&
                        arr[i].office.levels.indexOf('country') > -1) {
                        switch (arr[i].office.name) {
                            case 'President':
                                national[0] = arr[i];
                                break;
                            case 'Vice President':
                                national[1] = arr[i];
                                break;
                            default:
                                national.push(arr[i]);
                                break;
                        }

                    } else if (arr[i].office.divisionId.indexOf('county') > -1 ||
                        arr[i].office.divisionId.indexOf('place') > -1) {
                        local.push(arr[i]);


                    } else {
                        stateReps.push(arr[i]);
                    }
                    if(arr[i].channels){
                        for(var j = 0; j < arr[i].channels.length; j++){
                            if(arr[i].channels[j].type === "Facebook")
                                arr[i].facebook = arr[i].channels[j].id;
                            else if(arr[i].channels[j].type === "Twitter")
                                arr[i].twitter = arr[i].channels[j].id;
                        }
                    }

                }
                fixPicture(local);
                fixPicture(national);
                fixPicture(stateReps);
                return [national, stateReps, local];
            });
        }

        function getRepArrays() {
        	//returns an array of arrays that contain the needed info.
            return [national, stateReps, local];
        }
        function fixPicture(arr){
            var suffixes = ["Jr.", "Sr.", "II", "III", "IV", "V"];
            for(var i = 0; i<arr.length; i++){
                if(!arr[i].photoUrl){
                    var array = arr[i].name.split(" ");
                    if(suffixes.indexOf(array[array.length-1]) !== -1){
                        array.pop();
                    }
                    arr[i].initials = array[0][0]+array[array.length-1][0];
                }
            }
        }

    }

})();
