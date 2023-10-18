interface Properties {
    article: App.Data.Articles.ArticleData;
}

export const ArticleContent = ({ article }: Properties): JSX.Element => (
    <div className="prose max-w-none">
        <p>
            Lorem ipsum dolor, sit amet consectetur adipisicing elit. Esse voluptas neque cum fugit asperiores quo,
            numquam repellendus labore, sequi quae nihil provident vero consequatur iusto veritatis? Nostrum assumenda
            repudiandae sit?
        </p>

        <h2>Heading 2: Lorem ipsum dolor sit amet, consectetur adipiscing elit</h2>

        <p>
            Through this partnership, FaZe Clan and The Sandbox will work together to develop “FaZe World,” a 12x12 area
            within the game that embodies FaZe culture (which hopefully consists of drinking Mountain Dew and hitting
            360 no-scope trick shots). They’ll also be collaborating on events, games, digital products and other
            content for their fan base and The Sandbox community. This deal gives FaZe an opportunity to create new
            streams of income by gamifying their world and providing fans with more ways to interact with talent and
            members.
        </p>

        <h3>Heading 3: Lorem ipsum dolor sit amet, consectetur adipiscing elit</h3>

        <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Ipsum, dignissimos eius aliquam delectus quos
            deserunt perspiciatis ab eligendi tempore illo voluptates natus consectetur perferendis unde quo cum sequi
            earum vitae.
        </p>

        <h4>Heading 4: Lorem ipsum dolor sit amet, consectetur adipiscing elit</h4>

        <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Ipsum, dignissimos eius aliquam delectus quos
            deserunt perspiciatis ab eligendi tempore illo voluptates natus consectetur perferendis unde quo cum sequi
            earum vitae.
        </p>

        <h5>Heading 5: Lorem ipsum dolor sit amet, consectetur adipiscing elit</h5>

        <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Ipsum, dignissimos eius aliquam delectus quos
            deserunt perspiciatis ab eligendi tempore illo voluptates natus consectetur perferendis unde quo cum sequi
            earum vitae.
        </p>

        <h6>Heading 6: Lorem ipsum dolor sit amet, consectetur adipiscing elit</h6>

        <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Ipsum, dignissimos eius aliquam delectus quos
            deserunt perspiciatis ab eligendi tempore illo voluptates natus consectetur perferendis unde quo cum sequi
            earum vitae.
        </p>

        <blockquote>
            <p>
                FaZe Clan’s leadership position at the apex of gaming and youth culture presents an ideal opportunity to
                build bridges and lead the gaming community at large into the metaverse,” says Lee Trink, CEO of FaZe
                Clan. “Through FaZe World and our partnership with The Sandbox, our already digitally native fans can
                experience FaZe Clan in a new immersive way.
            </p>
        </blockquote>

        <p>Paragraph after blockquote.</p>

        <h4>Unordered list</h4>

        <ul>
            <li>
                Twitter is great for posting thoughts, insights, and nuggets of info, but isn't good at organizing long
                form conversations or getting valuable feedback from a community. It's difficult to follow a
                conversation, the discussion becomes littered with noise, and there is no way to stop random people from
                jumping in with bad insight or trolling.
                <ul>
                    <li>Comment systems are limited in scope and don't allow.</li>
                    <li>Comment systems are limited in scope and don't allow.</li>
                </ul>
            </li>
            <li>
                Spaces are great but it can be hard to keep track of upcoming events when you are following dozens of
                projects and it can be hard for projects to gauge what times are good for their followers. They are a
                great tool but need better organization and planning functions.
            </li>
        </ul>

        <p>
            Paragraph after list..., While there isn’t a set date for the upcoming FaZe Clan land sale yet, the tweets
            and videos by FaZe Clan and The Sandbox mentioned that FaZe Clan would be coming to the platform in 2023…
        </p>

        <h4>Ordered list</h4>

        <ol>
            <li>
                Twitter is great for posting thoughts, insights, and nuggets of info, but isn't good at organizing long
                form conversations or getting valuable feedback from a community. It's difficolt to follow a
                conversation, the discussion becomes littered with noise, and there is no way to stop random people from
                jumping in with bad insight or trolling.
                <ol>
                    <li>Comment systems are limited in scope and don't allow.</li>
                    <li>Comment systems are limited in scope and don't allow.</li>
                </ol>
            </li>
            <li>
                Spaces are great but it can be hard to keep track of upcoming events when you are following dozens of
                projects and it can be hard for projects to gauge what times are good for their followers. They are a
                great tool but need better organization and planning functions.
            </li>
        </ol>

        <p>
            Paragraph after list..., While there isn’t a set date for the upcoming FaZe Clan land sale yet, the tweets
            and videos by FaZe Clan and The Sandbox mentioned that FaZe Clan would be coming to the platform in 2023…
        </p>

        <h2>Esports Entering the Metaverse</h2>

        <p>
            Esports entering the Metaverse and Web3 is going to become more common in the next few years as teams look
            to increase their value and presence. Current stats from 2022 show that the top ten most profitable esports
            companies have skyrocketed 46% in the past year, now being worth a combined $3.5 billion. As an example, in
            July of this year, FaZe Clan made history as they became the first esports team listed on Nasdaq . This
            listing caused their value to instantly spike from 400 million US dollars to 725 million US dollars, making
            them one of the most valuable esports teams in the world.
        </p>

        <figure>
            <img
                src="https://images.unsplash.com/photo-1508138221679-760a23a2285b?auto=format&fit=crop&q=80&w=2874&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                alt="my alt text"
            />
            <figcaption>This is my caption text.</figcaption>
        </figure>

        <p>
            Text after image, Lorem ipsum dolor sit amet consectetur adipisicing elit. Odit quae ipsa temporibus
            voluptate, molestiae porro fuga pariatur aut illo nisi, quaerat quidem, sit ea molestias soluta doloribus
            saepe atque facere?
        </p>

        <img
            src="https://images.unsplash.com/photo-1508138221679-760a23a2285b?auto=format&fit=crop&q=80&w=2874&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="my alt text"
        />
    </div>
);
