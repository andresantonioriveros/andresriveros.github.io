# R2 Photo Upload

This site can serve gallery images from `https://images.andresriveros.com` backed by Cloudflare R2.

## Expected bucket layout

- `photos/` for all uploaded site images

The original vs edited distinction stays in the filename itself:

- files containing `-EDIT` or `_EDIT` are edited display variants
- files without that marker are treated as original files

## Prerequisites

- `wrangler` installed and authenticated
- an R2 bucket already created
- `images.andresriveros.com` bound to that bucket

## Dry run

```bash
python scripts/upload_photos_to_r2.py <bucket-name> --dry-run
```

## Upload

```bash
python scripts/upload_photos_to_r2.py <bucket-name>
```

The script uploads to remote R2 and skips files whose object key already exists.

## After upload

Update `web/_data/photos.yml` so entries use URLs from `https://images.andresriveros.com/photos/...`

Example:

```yml
- title: Red Road
  image: https://images.andresriveros.com/photos/20220314_124325-EDIT.jpg
  original_image: https://images.andresriveros.com/photos/20220314_124325.jpg
```
