# discord-printer
print attachements from discord message.

To install you need npm, node js and python.

## How to install
`npm install`

and

`pip install pdf2image`

### Windows

Windows users will have to build or download poppler for Windows. I recommend [@oschwartz10612 version](https://github.com/oschwartz10612/poppler-windows/releases/) which is the most up-to-date. You will then have to add the `bin/` folder to [PATH](https://www.architectryan.com/2018/03/17/add-to-the-path-on-windows-10/) or use `poppler_path = r"C:\path\to\poppler-xx\bin" as an argument` in `convert_from_path`.

### Mac

Mac users will have to install [poppler](https://poppler.freedesktop.org/).

Installing using [Brew](https://brew.sh/):

```
brew install poppler
```

### Linux

Most distros ship with `pdftoppm` and `pdftocairo`. If they are not installed, refer to your package manager to install `poppler-utils`

[Source for pdf2image installation](https://github.com/Belval/pdf2image/tree/master)