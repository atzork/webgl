export function resizeCanvas(canvas) {
    // получаем размер HTML-элемента canvas
    const displayWidth  = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;

    // проверяем, отличается ли размер canvas
    if (canvas.width !== displayWidth ||
        canvas.height !== displayHeight) {

        // подгоняем размер буфера отрисовки под размер HTML-элемента
        canvas.width  = displayWidth;
        canvas.height = displayHeight;
    }
}