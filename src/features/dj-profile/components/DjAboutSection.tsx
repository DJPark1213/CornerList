type Props = {
  about: string;
};

export default function DjAboutSection({ about }: Props) {
  return (
    <section>
      <h2 className="text-lg font-semibold text-foreground">About</h2>
      <p className="mt-2 leading-relaxed text-muted">{about}</p>
    </section>
  );
}
