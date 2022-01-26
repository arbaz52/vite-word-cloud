import "./style.css";

export const map = (
  val: number,
  cMin: number,
  cMax: number,
  tMin: number,
  tMax: number
) => {
  const slope = (tMax - tMin) / (cMax - cMin);
  return tMin + slope * (val - cMin);
};

export const isOverlapping = (rect1: DOMRect, rect2: DOMRect) =>
  rect1.x < rect2.x + rect2.width &&
  rect1.x + rect1.width > rect2.x &&
  rect1.y < rect2.y + rect2.height &&
  rect1.height + rect1.y > rect2.y;

type IData = {
  [key: string]: number;
};

type IConfig = {
  spreadX: number;
  spreadY: number;
  maxFontSize: number;
  minFontSize: number;
};

const generateWordCloud = (
  target: HTMLElement,
  data: IData,
  config: IConfig
) => {
  target.innerHTML = "";
  const { minFontSize, maxFontSize, spreadX, spreadY } = config;

  const words = Object.keys(data);
  const frequencies = Object.values(data);

  const maxFrequency = Math.max(...frequencies);
  const minFrequency = Math.min(...frequencies);

  const { width, height } = target.getBoundingClientRect();

  const wordEls: HTMLSpanElement[] = [];

  for (const word of words) {
    const frequency = data[word];

    const wordEl = document.createElement("span");
    wordEl.innerText = word;
    wordEl.style.top = "50%";
    wordEl.style.left = "50%";
    wordEl.style.position = "absolute";
    const fontSize =
      map(frequency, minFrequency, maxFrequency, minFontSize, maxFontSize) +
      "px";
    wordEl.style.fontSize = fontSize;
    wordEl.style.lineHeight = fontSize;

    wordEl.style.transform = `translate(-50%, -50%)`;
    wordEl.style.padding = "4px 8px";

    target.appendChild(wordEl);

    if (wordEls.length) {
      let radius = 0;
      for (let angle = 0; angle < 3_000; angle += 1) {
        const y = Math.sin(angle) * spreadY;
        const x = Math.cos(angle) * spreadX;
        const top = height / 2 + radius * y;
        const left = width / 2 + radius * x;

        wordEl.style.top = `${top}px`;
        wordEl.style.left = `${left}px`;
        const rect = wordEl.getBoundingClientRect();

        radius += 0.125;

        let overlapping = false;
        for (const existingEl of wordEls) {
          if (existingEl === wordEl) {
            console.debug("same");
            continue;
          }
          const rect1 = existingEl.getBoundingClientRect();

          overlapping = isOverlapping(rect, rect1);
          if (overlapping) break;
        }
        if (!overlapping) {
          wordEl.style.top = `${top}px`;
          wordEl.style.left = `${left}px`;

          target.appendChild(wordEl);
          wordEls.push(wordEl);
          break;
        }
      }
    } else {
      target.appendChild(wordEl);
      wordEls.push(wordEl);
    }
  }
};

const target = document.querySelector<HTMLElement>("#target");

const words =
  `Lorem ipsum dolor sit amet consectetur adipisicing elit. Facere, dolor sunt
aut nulla eos odio. Consectetur nemo optio vero sint.`.split(" ");

if (target)
  generateWordCloud(
    target,
    Object.fromEntries(
      new Map(
        words.filter(Boolean).map((word) => [word.trim(), Math.random() * 100])
      )
    ),
    {
      maxFontSize: 62,
      minFontSize: 12,
      spreadY: 1,
      spreadX: 2,
    }
  );
