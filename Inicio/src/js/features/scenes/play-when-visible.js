/**
 * Las animaciones de una escena solo corren mientras está en pantalla
 * (clase `is-playing`); fuera de vista se pausan para no gastar batería.
 */
export function playWhenVisible(element, threshold = 0.2) {
    new IntersectionObserver(([entry]) => {
        element.classList.toggle('is-playing', entry.isIntersecting);
        if (entry.isIntersecting) element.classList.add('has-played');
    }, { threshold }).observe(element);
}
