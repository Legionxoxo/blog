function isActiverRoute(route,currentRoute){
    return route === currentRoute ? 'active' : '';
}
module.exports={isActiverRoute};