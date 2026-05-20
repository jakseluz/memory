# Memory game

author: **Jakub Łabuz** ([jakseluz](https://github.com/jakseluz))

Popular game; see the wikipedia description on [Concentration card game](https://en.wikipedia.org/wiki/Concentration_(card_game)).

Fastly written, brief project, do not blame.

The game design is similiar to the one presented [here](https://www.youtube.com/watch?v=dqqxkrKhfS4). Nevertheless I had not looked there during the coding. It was one of the classes assignment and has been developed independently.

## Usage

1. **Clone the repository:**

   ```bash
   git clone https://github.com/jakseluz/memory.git
   cd memory
   ```

2. Provide images in a proper format:
    - create an ./img/ catalogue
    - paste there folders containing your variants images
    - adjust path names in the source code to fit them (themeImages const map) as beneath:
    ``` js
    const themeImages = new Map([
        [
            "variant_name_1",
            {
                numberOfImages: 28,
                filepathFromNumber: (imgNumber) => {
                    return `./img/1_avatars/name_img_${
                        imgNumber < 10 ? "0" : ""
                    }${imgNumber}.jpg`;
                },
            },
        ],
        [
            "variant_name_2",
            {
                numberOfImages: 42,
                filepathFromNumber: (imgNumber) => {
                    return `./img/2_avatars/250px_2_2077_${imgNumber}.png`;
                },
            },
        ],
        [
            "variant_name_3",
            {
                numberOfImages: 20,
                filepathFromNumber: (imgNumber) => {
                    return `./img/3_avatars/3_${imgNumber}.jpg`;
                },
            },
        ],
    ]);

    ```
    - remember that e.g. 6x6 mode cannot be available with less than 18 (6*6/2) different images
    - remember that each image in the above version of the code - has to have the same name with different ending number
    - maybe I will upload some example images later. Previously I'd been using avatars from popular computer games. Due to copyrights, unfortunately, I cannot upload them here.

3. Double click the [memory.html](./memory.html) file to run the game.

4. Play it, knowing the standard rules.

5. You can compare your sessions by saving your nickname and score (containing number of moves, time and the size variant - 2x2 / 4x4 / 6x6) into a JSON file on a server, which is available by a token in your browser local storage.

6. To restart the game - refresh the page (e.g. hit F5 button).

## Used resources
- [question mark card](https://pixabay.com/pl/illustrations/question-information-round-2651795/)