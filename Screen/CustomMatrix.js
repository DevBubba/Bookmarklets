javascript:(function()%7Bjavascript%3A (function() %7B%0A    var letter %3D prompt('What letter%3F')%3B%0A    var color %3D prompt('What color%3F')%3B%0A    var speed %3D prompt('What speed%3F')%3B%0A    var container %3D document.createElement('div')%3B%0A    document.body.appendChild(container)%3B%0A    container.style.position %3D 'fixed'%3B%0A    container.style.top %3D '0'%3B%0A    container.style.left %3D '0'%3B%0A    container.style.width %3D '100%25'%3B%0A    container.style.height %3D '100%25'%3B%0A    container.style.overflow %3D 'hidden'%3B%0A    container.style.pointerEvents %3D 'none'%3B%0A%0A    function init() %7B%0A        var injection %3D document.createElement('style')%3B%0A        document.body.appendChild(injection)%3B%0A        injection.innerHTML %3D '%40-webkit-keyframes snow %7B%5Cnfrom %7Btop%3A-1%25%3B%7D%5Cnto%7Btop%3A121%25%3B%7D%7D%5Cn%40-moz-keyframes snow %7B%5Cnfrom %7Btop%3A -1%25%3B%7D%5Cnto %7Btop%3A 121%25%3B%7D%5Cn%7D'%3B%0A    %7D%0A    init()%3B%0A    window.setInterval(createParticle%2C speed)%3B%0A    timeChoices %3D %5B5%2C 6%2C 7%2C 8%2C 9%2C 10%5D%3B%0A%0A    function destroy(evt) %7B%0A        container.removeChild(evt.target)%3B%0A    %7D%0A%0A    function createParticle() %7B%0A        var particle %3D document.createElement('span')%3B%0A        var randomSpeed %3D timeChoices%5BMath.floor(Math.random() * timeChoices.length)%5D%3B%0A        particle.innerHTML %3D letter%3B%0A        particle.className %3D 'flake'%3B%0A        particle.style.position %3D 'absolute'%3B%0A        particle.style.color %3D color%3B%0A        particle.style.backgroundColor %3D 'transparent'%3B%0A        particle.style.width %3D '5px'%3B%0A        particle.style.height %3D '5px'%3B%0A        particle.style.pointerEvents %3D 'none'%3B%0A        particle.style.right %3D Math.random() * 100 %2B '%25'%3B%0A        particle.style.borderRadius %3D '50%25'%3B%0A        particle.style.WebkitAnimation %3D 'snow ' %2B randomSpeed %2B 's linear'%3B%0A        container.appendChild(particle)%3B%0A        particle.addEventListener('webkitAnimationEnd'%2C destroy)%3B%0A    %7D%0A%7D)()%7D)()%3B
