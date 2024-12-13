document.addEventListener("DOMContentLoaded", () => {
    const timeline = document.getElementById("timeline");
    const modal = document.getElementById("modal");
    const modalTitle = document.getElementById("event-title");
    const modalDescription = document.getElementById("event-description");
    const closeModal = document.getElementById("close-modal");
    const alternativeContainer = document.getElementById("alternative-timelines-container");

    const startYear = 0;
    const endYear = 2100;
    const totalYears = endYear - startYear;

    // Создаем метки на основном таймлайне
    function createTimelineMarks(start, end, step, container, markClass="timeline-mark", lineStart=startYear, lineTotal=totalYears) {
        for(let year=start; year<=end; year+=step) {
            const posPercent=((year-lineStart)/lineTotal)*100;
            const mark=document.createElement("div");
            mark.className=markClass;
            mark.style.left=posPercent+"%";
            mark.textContent=year;
            container.appendChild(mark);
        }
    }

    createTimelineMarks(startYear, endYear, 100, timeline);

    // Пример альтернативных данных
    const alternativesData={
        "476-Падение Римской Империи":[
            {
                title:"Римская империя не распалась",
                color:"#aabbcc",
                scenario:[
                    {year:500, text:"К 500 году империя процветала... Технологии, искусство, культура..."},
                    {year:600, text:"К 600 году Рим освоил новые территории и технологии..."}
                ]
            },
            {
                title:"Империя распалась, но позже",
                color:"#ffcc00",
                scenario:[
                    {year:500,text:"Империя держалась, но трещины были очевидны..."},
                    {year:550,text:"К 550 году империя всё же пала, но последствия были иными..."}
                ]
            },
            {
                title:"Открытие электричества в Риме",
                color:"#66ff66",
                scenario:[
                    {year:480,text:"В 480 году римляне случайно открыли электричество..."},
                    {year:550,text:"К 550 году электричество изменило всё: досрочная индустриализация..."}
                ]
            }
        ]
    };

    function createTimelineMarksForAlternative(container) {
        for(let year=startYear; year<=endYear; year+=200) {
            const posPercent=((year - startYear)/totalYears)*100;
            const mark=document.createElement("div");
            mark.className="alternative-timeline-mark";
            mark.style.left=posPercent+"%";
            mark.textContent=year;
            container.appendChild(mark);
        }
    }

    function showAlternativeScenario(alt, scEvent, eventDiv) {
        // Удаляем предыдущий сценарий
        let old = eventDiv.querySelector(".alt-scenario-block");
        if(old) old.remove();

        let scenarioBlock = document.createElement("div");
        scenarioBlock.className="alt-scenario-block";
        let h3=document.createElement("h3");
        h3.textContent=`${scEvent.year} год — Альтернативный сценарий:\n${alt.title}`;
        let txt=document.createElement("div");
        txt.textContent=scEvent.text;

        scenarioBlock.appendChild(h3);
        scenarioBlock.appendChild(txt);
        eventDiv.appendChild(scenarioBlock);
    }

    function createAlternativeTimelines(alternatives, eventYear, eventTitle, eventX, eventY) {
        alternativeContainer.innerHTML="";

        const key = `${eventYear}-${eventTitle}`;
        const eventAlternatives = alternativesData[key];
        if(!eventAlternatives) return;

        // Ветки будем располагать вокруг события.
        // eventX,eventY - координаты события в px относительно контейнера.
        // Расположим ветки под углом: первая чуть выше, вторая ниже, и т.д.
        // Смещения по вертикали:
        const verticalOffsets=[-50,50,-100,100]; // Для 4 альтернатив, можно больше
        // Если альтернатив больше, будут использоваться эти смещения циклически.

        eventAlternatives.forEach((alt, i)=>{
            const wrapper=document.createElement("div");
            wrapper.className="alternative-timeline-wrapper";

            wrapper.style.left=(eventX)+"px";
            wrapper.style.top=(eventY+verticalOffsets[i%verticalOffsets.length])+"px";

            const line=document.createElement("div");
            line.className="alternative-timeline";
            line.style.backgroundColor=alt.color||"#ff5555";
            wrapper.appendChild(line);

            // Метки
            createTimelineMarksForAlternative(wrapper);

            // События
            alt.scenario.forEach(sce=>{
                const posPercent=((sce.year - startYear)/totalYears)*100;
                const ev=document.createElement("div");
                ev.className="alternative-event";
                ev.style.left=posPercent+"%";
                const c=document.createElement("div");
                c.className="circle";
                c.style.backgroundColor=alt.color||"#ff5555";
                ev.appendChild(c);
                ev.setAttribute("data-title",`${sce.year} — Альтернатива`);
                ev.addEventListener("click",(e)=>{
                    e.stopPropagation();
                    showAlternativeScenario(alt, sce, ev);
                });
                wrapper.appendChild(ev);
            });

            alternativeContainer.appendChild(wrapper);
            requestAnimationFrame(()=>{line.classList.add("show");});
        });
    }

    // Загружаем основные данные
    fetch('timeline_data.json')
    .then(r=>{
        if(!r.ok) throw new Error("Ошибка загрузки:"+r.status);
        return r.json();
    })
    .then(data=>{
        if(!Array.isArray(data)||data.length===0) return;

        data.forEach(event=>{
            const eventYear=event.year;
            if(!eventYear||isNaN(eventYear))return;
            const posPercent=((eventYear - startYear)/totalYears)*100;
            const ediv=document.createElement("div");
            ediv.className="event";
            ediv.style.left=posPercent+"%";
            ediv.setAttribute("data-title",`${eventYear} — ${event.title}`);
            ediv.setAttribute("data-description",event.description||"");
            const circ=document.createElement("div");
            circ.className="circle";
            ediv.appendChild(circ);
            timeline.appendChild(ediv);

            ediv.addEventListener("click",()=>{
                modalTitle.textContent=`${eventYear} — ${event.title}`;
                modalDescription.textContent=event.description||"Нет описания.";
                modal.classList.add("show");

                let altBtn=document.getElementById("view-alternatives-btn");
                if(!altBtn) {
                    altBtn=document.createElement("button");
                    altBtn.id="view-alternatives-btn";
                    altBtn.textContent="Альтернативные сценарии";
                    modal.querySelector(".modal-content").appendChild(altBtn);
                }

                const key=`${eventYear}-${event.title}`;
                const hasAlt=alternativesData[key];
                if(hasAlt&&hasAlt.length>0) {
                    altBtn.style.display="inline-block";
                    altBtn.onclick=()=>{
                        modal.classList.remove("show");
                        // Получаем точное положение события
                        const containerRect=document.getElementById("timeline-container").getBoundingClientRect();
                        const eventRect=ediv.getBoundingClientRect();
                        const eventX=eventRect.left - containerRect.left;
                        const eventY=(eventRect.top - containerRect.top);
                        createAlternativeTimelines(hasAlt,eventYear,event.title,eventX,eventY);
                    };
                } else {
                    altBtn.style.display="none";
                }
            });
        });
    })
    .catch(e=>console.error(e));

    closeModal.addEventListener("click",()=>{modal.classList.remove("show");});
    modal.addEventListener("click",(e)=>{
        if(e.target===modal) modal.classList.remove("show");
    });
});
