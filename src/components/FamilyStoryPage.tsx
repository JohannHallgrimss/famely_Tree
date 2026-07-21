const FamilyStoryPage = () => (
  <main className="page-shell">
    <section className="card story-card">
      <div className="story-intro">
        <p className="eyebrow">Framtíðarsíða</p>
        <h2>Ættarsaga</h2>
        <p>
          Hér er hægt að setja inn stutta ættarsögu, myndir og mikilvægar minningar um fjölskylduna.
        </p>
      </div>
      <div className="story-grid">
        <div className="story-panel">
          <h3>Áherslur</h3>
          <p>Skýrar sögur, myndir og dagsetningar sem hægt er að stækka síðar.</p>
        </div>
        <div className="story-panel">
          <h3>Til að bæta við</h3>
          <p>Texta, myndir, myndaröð og tengla við einstaka einstaklinga.</p>
        </div>
      </div>
    </section>
  </main>
);

export default FamilyStoryPage;
