
import type { FamilyData } from '../types';

interface FamilyStoryPageProps {
  data: FamilyData;
}

export const FamilyStoryPage = ({ data }: FamilyStoryPageProps) => {

  return (
    <main className="page-shell">
      <section className="card story-card">
        <div className="story-intro">
          <p className="eyebrow">Framtíðarsíða</p>
          <h2>Ættarsaga</h2>
          <p>
            Hér er hægt að setja inn stutta ættarsögu og mikilvægar minningar um fjölskylduna.
          </p>
        </div>
        <div className="story-grid">
          <div className="story-panel">
            {data.familyStories?.length ? (
              data.familyStories.map((story, index) => (
                <p key={index}>{story}</p>
              ))
            ) : (
              <p>Engar sögur skráðar.</p>
            )}
          </div>
          <div className="story-panel">
            {data.familyStories2?.length ? (
              data.familyStories2.map((story, index) => (
                <p key={index}>{story}</p>
              ))
            ) : (
              <p>Engar sögur skráðar.</p>
            )}
          </div>
        </div>
      </section>
    </main>
  )
};
export default FamilyStoryPage;
