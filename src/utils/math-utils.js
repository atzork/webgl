export const randomInt = (range) => Math.floor(Math.random() * range)

export const getSinCosByAngleDeg = (degrees) => {
    const radians = degrees * Math.PI / 180
    const sin = Math.sin(radians)
    const cos = Math.cos(radians)
    return [sin, cos]
}