document.addEventListener('DOMContentLoaded', async () => {
    const objects = waterObjects
    const dict = dictionary
    const loadMap = () => {
        const map = L.map('map', {
            // zoomControl: false,
            // preferCanvas: true,
        }).setView([49.277889077301, 27.024095851718233], 7);
        const visicom = new L.TileLayer('https://tms{s}.visicom.ua/2.0.0/land,ua/base/{z}/{x}/{y}.png?key=e6914b3543d65a2531c893d7362e041d', {
            attribution: 'Картографічні дані © АТ «<a href="https://api.visicom.ua/">Візіком</a>»',
            maxZoom: 19,
            subdomains: '123',
            minZoom: 6,
            tms: true
        })
        loadBorders(coordinates.geometry.coordinates[0], map)
        visicom.addTo(map)
        loadObjects(map)

    }
    const loadBorders = (data, map) => {
        data.forEach((el) => {
            el.reverse()
        })
        let border = new L.Polygon([data], { color: 'rgba(0,0,0,0.3)', fillColor: '#000' })
        border.addTo(map)
    }
    const formatString = (str) => {
        return +(str.replace(',', '.'))
    }
    const getMarkerColor = (obj) => {
        let colors = []
        Object.entries(obj).forEach(([key, value]) => {
            if (key.includes('_Excess')) {
                const formattedValue = +(value.replace(',', '.'))
                colors.push(getColor(formattedValue))
            }
        })
        let counts = []
        let max = [
            {
                count: 0,
                color: '#006eb9'
            }
        ]
        colors.forEach(el => {
            let count = colors.filter(x => x == el).length
            if (colors.filter(x => x == el && x !== '').length > max[0].count) {
                max.pop()
                max.push({ count: count, color: el })
            }
        })
        return max[0].color
    }
    const loadObjects = (map) => {
        objects.forEach((obj) => {
            const { Post_Name, Riverbas_Name, Latitude, Longitude, WaterLab_Name } = obj
            const tuple = [formatString(Latitude), formatString(Longitude)]
            const markerIcon = new L.divIcon({
                className: '',
                html: `
                    <div class="marker-icon">
                        <span class="material-icons" style="color:${getMarkerColor(obj) || '#006eb9'}">
                        water_drop
                        </span>
                    </div>
                `

            })

            const marker = new L.marker(tuple, {
                icon: markerIcon,
                data: obj
            })
            marker.on('click', (e) => {
                map.setView(tuple, 14)
                openObject(e.target.options.data)

            })
            marker.addTo(map)

        })
        const markers = document.querySelectorAll('.marker-icon')
        console.log(markers)
        markers.forEach(el => {
            el.onclick = () => {
                markers.forEach(el => el.classList.remove('active'))
                el.classList.add('active')
            }
        })
    }

    const getNameFromDict = (name) => {
        let normName = ''
        dictionary.forEach(el => {
            if (name.includes(el.shortName)) {
                normName = el.name
            }
        })
        return normName
    }
    const innerData = (obj, infoBlock) => {
        infoBlock.querySelector('.object__name').innerHTML = obj.Post_Name
        infoBlock.querySelector('.object__lab').innerHTML = obj.WaterLab_Name

        infoBlock.querySelector('.river__name').innerHTML = `
            <span class="option">Ріка: </span>
            <span class="value">${obj.Riverbas_Name}</span>
        `
        infoBlock.querySelector('.report__id').innerHTML = `
            <span class="option">Номер звернення: </span>
            <span class="value">${obj.Report_ID}</span>
        `
        infoBlock.querySelector('.monitoring__id').innerHTML = `
            <span class="option">Номер вимірювання: </span>
            <span class="value">${obj.IDCard_Monitoring}</span>
        `
        infoBlock.querySelector('.control__date').innerHTML = `
            <span class="option">Дата вимірювання: </span>
            <span class="value">${obj.Controle_Date}</span>
        `
    }
    const getColor = (value) => {
        let color = ''
        switch (true) {
            case value < 2 && value > 1:
                color = '#006eb9'
                break;
            case value < 3 && value > 2:
                color = '#188f00'
                break;
            case value > 3 && value < 4:
                color = '#bdc900'
                break;
            case value > 4 && value < 5:
                color = '#e1af18'
                break;
            case value > 5:
                color = '#dd0002'
                break;
            default:
                color = ''

        }
        return color;
    }
    const openObject = (obj) => {
        const infoBlock = document.querySelector('.info-object')
        infoBlock.classList.remove('hidden')
        infoBlock.querySelector('.object__close').onclick = () => {
            document.querySelectorAll('.marker-icon').forEach(el => el.classList.remove('active'))

            infoBlock.classList.toggle('hidden')
        }
        innerData(obj, infoBlock)
        const subParent = infoBlock.querySelector('tbody')
        subParent.innerHTML = ''
        Object.entries(obj).forEach(([key, value]) => {
            if (key.includes('_Norm')) {
                let name = getNameFromDict(key)
                let factValue = +(obj[key.split('_Norm')[0] + '_Value'].replace(',', '.'))
                let excessValue = +(obj[key.split('_Norm')[0] + '_Excess'].replace(',', '.'))
                let normValue = +(obj[key.split('_Norm')[0] + '_Norm'].replace(',', '.'))
                const line = document.createElement('tr')
                line.innerHTML = `
                    <td>
                        <span class="pok__name">
                            ${name}
                        </span>
                    </td>
                    <td>${factValue || '&mdash;'}</td>
                    <td>${normValue || '&mdash;'}</td>
                    <td>
                        <div class="excess__div">
                                <span class="exec__value">
                                    ${excessValue || '&mdash;'}
                                </span>
                            <div class="exec__circle" style="background-color:${getColor(excessValue)}"></div>

                            </div>
                        </div>
                    </td>
                `
                subParent.append(line)
            }
        })

    }

    loadMap()

})