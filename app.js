var app = angular.module('app',[])
    .directive('fileModel', ['$parse', function($parse){
        return {
            restrict: 'A',
            link: function(scope, element, attrs){
                var model = $parse(attrs.fileModel);
                var modelSetter = model.assign;

                element.bind('change', function(){
                    scope.$apply(function(){
                        modelSetter(scope, element[0].files[0]);
                    })
                })
            }
        }
    }])
    .service('giphyQuery',['$http', '$q', function giphyQuery($http, $q){
        var result = this;
        result.get = function(searchQuery){
            var defer = $q.defer();
            $http.get(searchQuery)
                .then(function (response) {
                    defer.resolve(response);
                }, function (error) {
                    defer.reject(error);
                });
            return defer.promise;
        };
        result.post = function(data){
            var defer = $q.defer();
            $http.post('//upload.giphy.com/v1/gifs', data ,{
                    transformRequest: angular.indentity,
                    headers : {'Content-Type': undefined}
                })
                .then(function (response) {
                    defer.resolve(response);
                }, function (error) {
                    defer.reject(error);
                });
            return defer.promise;
        };

        return result
    }])
    .controller('giphyCtrl', ['$scope', '$http', '$window', 'giphyQuery',function($scope, $http, $window, giphyQuery) {
        $scope.col = 4;
        $scope.myCollectionCol = 2;
        $scope.uploadActive=false;
            $scope.user = {
                userName:'',
                userLogin:'',
                login : function(username){
                    $scope.user.userName = username;
                    $scope.myCollection.load($scope.user.userName);
                }
            };

            angular.element($window).bind("scroll", function() {
                var windowHeight = "innerHeight" in window ? window.innerHeight : document.documentElement.offsetHeight;
                var body = document.body, html = document.documentElement;
                var docHeight = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight,  html.scrollHeight, html.offsetHeight);
                windowBottom = windowHeight + window.pageYOffset;
                if (windowBottom >= docHeight) {
                    if(!$scope.giphy.inProgress){
                        $scope.images.getDataWithOffset();
                    }
                }
            });

            $scope.getCol = function(num) {
                return new Array(num);
            };
            $scope.getImageStyle = function(item,index){
                var colrs = ["rgb(85, 211, 176)","rgb(81, 171, 176)","rgb(88, 226, 134)","rgb(163, 189, 242)","rgb(135, 178, 194)","rgb(235, 226, 119)","rgb(183, 231, 119)"];
                return {
                    "width": item.width+"px",
                    "height": item.height+"px",
                    "background-color": colrs[index%colrs.length]
                }
            };
            $scope.giphy = {
                src : '//api.giphy.com/v1/gifs/search?q=',
                api_key : 'dc6zaTOxFJmzC',
                offset : 25,
                currentOffset : 25,
                inProgress : false,
                isUserSearch : false,
                uploadData:{
                    file: '',
                    api_key: 'dc6zaTOxFJmzC',
                    tags: ''
                },
                search: function () {
                    var query = $scope.searchField.replace(/\s/g, '+');
                    return this.src + query + '&api_key=' + $scope.giphy.api_key;
                },
                getByIds: function (ids_arr) {
                    return "http://api.giphy.com/v1/gifs?api_key=" + $scope.giphy.api_key + "&ids=" + ids_arr.join(',');
                },
                getById: function (id) {
                    return "http://api.giphy.com/v1/gifs/"+id+"?api_key=" + $scope.giphy.api_key;
                },

                getWithOffset :function(){
                    if($scope.giphy.isUserSearch){
                        var query = $scope.searchField.replace(/\s/g, '+');
                        return this.src + query + '&api_key='+$scope.giphy.api_key+'&offset='+$scope.giphy.currentOffset;

                    }else{
                        return '//api.giphy.com/v1/gifs/trending?api_key='+$scope.giphy.api_key+'&offset='+$scope.giphy.currentOffset;

                    }
                },
                upload: function() {
                        var formData = new FormData();
                        for(var key in $scope.giphy.uploadData){
                            formData.append(key, $scope.giphy.uploadData[key]);
                        }
                        return formData;
                }
            };
            $scope.images = {
                data:[],
                currentImage:'',
                modal: false,
                getData : function(){
                    giphyQuery.get('//api.giphy.com/v1/gifs/trending?api_key=dc6zaTOxFJmzC&limit=25')
                        .then(function(response){
                            $scope.images.data = response.data.data;
                        }, function(error){
                            console.log(error);
                        })
                },
                getSearchData: function(){
                    giphyQuery.get($scope.giphy.search())
                        .then(function(response){
                            $scope.images.data = response.data.data;
                        }, function(error){
                            console.log(error);
                        })
                },
                getDataWithOffset : function(){
                    $scope.giphy.inProgress = true;
                    giphyQuery.get($scope.giphy.getWithOffset())
                        .then(function(response){
                            $scope.images.data = $scope.images.data.concat(response.data.data);
                            $scope.giphy.currentOffset += $scope.giphy.offset;
                            $scope.giphy.inProgress = false;
                        }, function(error){
                            console.log(error);
                        })
                },
                show: function(item){
                    $scope.images.currentImage = item.images.original.url;
                    $scope.images.modal = true;
                }
            };
            $scope.myCollection = {
                data:[],
                imageData:[],
                load: function(username){
                    if(localStorage.getItem(username)){
                        $scope.myCollection.data = JSON.parse(localStorage.getItem(username));
                        giphyQuery.get($scope.giphy.getByIds($scope.myCollection.data))
                            .then(function(response){
                                $scope.myCollection.imageData = response.data.data;
                            }, function(error){
                                console.log(error);
                            });
                    }
                },
                add: function(item){
                    if($scope.myCollection.data.indexOf(item.id) == -1){
                        $scope.myCollection.data.push(item.id);
                        localStorage.setItem($scope.user.userName, JSON.stringify($scope.myCollection.data));

                        giphyQuery.get($scope.giphy.getById(item.id))
                            .then(function(response){
                                $scope.myCollection.imageData.push(response.data.data);
                            }, function(error){
                                console.log(error);
                            });
                    }
                },
                remove: function(index){
                    $scope.myCollection.data.splice(index,1);
                    $scope.myCollection.imageData.splice(index,1);
                    localStorage.setItem($scope.user.userName, JSON.stringify($scope.myCollection.data));
                },
                upload : function(){
                    giphyQuery.post($scope.giphy.upload())
                        .then(function(response){
                            if(response.data.meta.status == 200){
                                $scope.myCollection.add(response.data.data);
                                $scope.uploadActive = false;
                            }else{
                                alert('wrong file type!');
                            }

                        }, function(error){
                            console.log(error);
                        });
                }
            };

        $scope.images.getData();

        if(window.innerWidth >995){
            $scope.col = 4;
        }
        if(window.innerWidth <=995){
            $scope.col = 3;
        }
        if(window.innerWidth <=735){
            $scope.col = 2;
        }
        if(window.innerWidth <=500){
            $scope.col = 1;
        }
        $(window).resize(function(){
            $scope.$apply(function(){
                if(window.innerWidth >995){
                    $scope.col = 4;
                }
                if(window.innerWidth <=995){
                    $scope.col = 3;
                }
                if(window.innerWidth <=735){
                    $scope.col = 2;
                }
                if(window.innerWidth <=500){
                    $scope.col = 1;
                }
            });
        });

    }]);


