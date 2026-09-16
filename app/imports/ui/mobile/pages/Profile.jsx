import React, { useMemo, useRef } from "react";
import PropTypes from "prop-types";
import { Meteor } from "meteor/meteor";
import { withRouter } from "react-router-dom";
import { useTracker } from "meteor/react-meteor-data";
import swal from "sweetalert";
import { isAdminRole } from "../../desktop/components/NavBarRoleUtils";
import { Rides } from "../../../api/ride/Rides";
import { Places } from "../../../api/places/Places";
import { Profiles } from "../../../api/profile/Profile";
import { Schools } from "../../../api/schools/Schools";
import { Reviews } from "../../../api/reviews/Reviews";
import { estimateRoute } from "../../../api/ride/routeEstimate";
import Avatar from "../../components/Avatar";
import Icon from "../../components/Icon";
import MapBg from "../../components/MapBg";
import {
  Page,
  Banner,
  BannerMap,
  Inner,
  Header,
  AvatarFrame,
  HeaderMain,
  NameRow,
  Name,
  VerifiedChip,
  VerifyChip,
  MetaRow,
  MetaItem,
  MetaSep,
  Bio,
  HeaderActions,
  GhostBtn,
  PrimaryBtn,
  StatStrip,
  StatCard,
  StatLabel,
  StatValue,
  StatUnit,
  StatStar,
  Columns,
  Col,
  Card,
  CardHead,
  CardTitle,
  CardFoot,
  LinkBtn,
  PlaceGrid,
  PlaceTile,
  PlaceIcon,
  PlaceText,
  PlaceName,
  PlaceSub,
  ReviewList,
  ReviewRow,
  ReviewBody,
  ReviewHead,
  ReviewName,
  Stars,
  Quote,
  PrefList,
  PrefRow,
  PrefLabel,
  PrefValue,
  CheckList,
  CheckRow,
  CheckMark,
  CheckLabel,
  CheckNote,
  Empty,
  SettingsSection,
  Section,
  SectionTitle,
  MenuList,
  MenuItem,
  MenuItemIcon,
  MenuItemLabel,
  MenuArrow,
  SignOutBtn,
  Loading,
} from "../styles/Profile";

/* Icon names, not emoji: the rest of the app draws from one stroke set, and
 * mixing platform emoji in made this screen look assembled from a different
 * kit -- different weights, different colours, different vertical centring. */
const ADMIN_LINKS = [
  { icon: "user", label: "Manage users", path: "/admin/users" },
  { icon: "clock", label: "Pending approvals", path: "/admin/pending-users" },
  { icon: "car", label: "Manage rides", path: "/admin/rides" },
  { icon: "school", label: "School settings", path: "/admin/school-management" },
  { icon: "pin", label: "Manage places", path: "/admin/places" },
  { icon: "flame", label: "Error reports", path: "/admin/error-reports" },
];

const LEGAL_LINKS = [
  { icon: "doc", label: "Terms of Service", path: "/terms" },
  { icon: "shield", label: "Privacy Policy", path: "/privacy" },
  { icon: "sparkle", label: "Credits", path: "/credits" },
];

/* Decoration only — the tile colour says nothing about the place. */
const PLACE_TINTS = [
  "var(--signal-yellow-deep)",
  "var(--sky)",
  "var(--leaf)",
  "var(--plum)",
];

const ROLE_COPY = {
  Both: "Rider · sometimes driver",
  Driver: "Mostly driving",
  Rider: "Mostly riding",
};

const MAX_SAVED_PLACES = 4;
const MAX_REVIEWS_SHOWN = 3;

/* Deterministic hue so an account always gets the same avatar colour, matching
 * the nav avatar. */
const hueFor = (seed) => {
  if (!seed) return 220;
  let total = 0;
  for (let i = 0; i < seed.length; i += 1) total += seed.charCodeAt(i);
  return total % 360;
};

/* Show only the last four digits. The country code is not modelled, so the
 * mask keeps the shape without asserting one. */
const maskPhone = (raw) => {
  const digits = String(raw).replace(/\D/g, "");
  if (digits.length < 4) return "on file";
  return `(•••) •••-${digits.slice(-4)}`;
};

const fmtMonth = date => new Date(date)
  .toLocaleDateString("en-US", { month: "short", year: "numeric" });

const Profile = ({ history }) => {
  const settingsRef = useRef(null);

  const {
    ready, currentUser, isAdmin, myProfile, school, places, placeCoords, rides, reviews,
  } = useTracker(() => {
    const uid = Meteor.userId();
    const user = Meteor.user();
    const subs = [
      // userProfile publishes the caller's own document unprojected, so the
      // year / major / identityVerified fields this page reads are
      // actually present. profiles.interacted projects to {Name, Owner}.
      Meteor.subscribe("userProfile"),
      Meteor.subscribe("Rides"),
      Meteor.subscribe("places.mine"),
    ];
    if (uid) subs.push(Meteor.subscribe("reviews.forUser", uid));
    if (user?.schoolId) subs.push(Meteor.subscribe("schools.byId", user.schoolId));

    const coords = {};
    Places.find({}).forEach((place) => {
      coords[place._id] = place.value;
    });

    return {
      ready: subs.every(s => s.ready()),
      currentUser: user,
      isAdmin: user ? isAdminRole(user) : false,
      myProfile: uid ? Profiles.findOne({ Owner: uid }) : null,
      school: user?.schoolId ? Schools.findOne(user.schoolId) : null,
      places: Places.find({}, { sort: { createdAt: -1 } }).fetch(),
      placeCoords: coords,
      rides: Rides.find({}).fetch(),
      reviews: uid ? Reviews.find({ subject: uid }, { sort: { createdAt: -1 } }).fetch() : [],
    };
  }, []);

  // Keyed on a string so the dependent subscription only re-runs when the set
  // of authors actually changes, not on every reactive re-fetch.
  const authorKey = reviews.map(r => r.author).join(",");
  const authorIds = useMemo(
    () => (authorKey ? Array.from(new Set(authorKey.split(","))) : []),
    [authorKey],
  );

  const authorName = useTracker(() => {
    if (authorIds.length === 0) return {};
    Meteor.subscribe("profiles.displayNames", authorIds);
    const map = {};
    Profiles.find({ Owner: { $in: authorIds } }).forEach((p) => {
      map[p.Owner] = p.Name;
    });
    return map;
  }, [authorIds]);

  const go = path => history.push(path);

  const goSettings = () => {
    if (settingsRef.current) {
      settingsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const verifyIdentity = () => {
    const persona = Meteor.settings.public?.persona;
    const inquiryTemplateId = persona?.templateId || "itmpl_PygaeTqwQpVeoiAMmVmZzrWwezCN";
    const environmentId = persona?.environmentId || "env_5ZRRvhfj6N4FoUoQ2e4KSv19gUuG";
    const referenceId = currentUser._id;
    const redirectUri = encodeURIComponent("https://carp.school");
    const url = `https://miniapp.withpersona.com/verify?inquiry-template-id=${inquiryTemplateId}`
      + `&environment-id=${environmentId}&reference-id=${referenceId}&redirect-uri=${redirectUri}`;
    window.open(url, "_blank", "noopener");
  };

  const deleteAccount = () => {
    swal({
      title: "Delete your account?",
      text: "This permanently removes your profile, rides, saved places, "
        + "and chat history and cannot be undone.",
      icon: "warning",
      buttons: {
        cancel: "Cancel",
        confirm: { text: "Delete", className: "swal-button--danger" },
      },
    }).then((confirmed) => {
      if (!confirmed) return;

      swal({
        title: "Type DELETE to confirm",
        content: {
          element: "input",
          attributes: { placeholder: "DELETE" },
        },
        buttons: {
          cancel: "Cancel",
          confirm: { text: "Confirm", className: "swal-button--danger" },
        },
      }).then((typed) => {
        if (typed !== "DELETE") {
          if (typed !== null) swal("Cancelled", "You must type DELETE exactly.", "info");
          return;
        }
        Meteor.call("accounts.deleteMyAccount", (error) => {
          if (error) {
            swal("Error", error.reason || error.message, "error");
          } else {
            swal("Account deleted", "Signing you out.", "success").then(() => {
              history.push("/");
            });
          }
        });
      });
    });
  };

  if (!ready) {
    return (
      <Page>
        <Banner>
          <BannerMap><MapBg /></BannerMap>
        </Banner>
        <Inner><Loading>Loading…</Loading></Inner>
      </Page>
    );
  }

  const email = currentUser?.emails?.[0]?.address || "";
  const accountName = `${currentUser?.profile?.firstName || ""} ${currentUser?.profile?.lastName || ""}`.trim();
  const fullName = myProfile?.Name || accountName || email.split("@")[0] || "Your profile";

  const eduVerified = Boolean(myProfile?.schoolemail);
  const identityVerified = Boolean(myProfile?.identityVerified);
  const schoolName = school?.shortName || school?.name || "";

  // Stats, all derived from rides this user drove or rode in.
  const now = new Date();
  const completed = rides.filter(r => new Date(r.date) < now);
  const milesShared = completed.reduce((sum, r) => {
    if (typeof r.distanceMi === "number") return sum + r.distanceMi;
    const est = estimateRoute(placeCoords[r.origin], placeCoords[r.destination]);
    return sum + (est ? est.distanceMi : 0);
  }, 0);
  const ratingCount = reviews.length;
  const ratingAvg = ratingCount === 0
    ? 0
    : reviews.reduce((sum, r) => sum + r.stars, 0) / ratingCount;

  const metaItems = [];
  if (schoolName) {
    metaItems.push(
      <MetaItem key="school"><Icon name="school" size={13} />{schoolName}</MetaItem>,
    );
  }
  if (myProfile?.year) metaItems.push(<MetaItem key="year">{myProfile.year}</MetaItem>);
  if (myProfile?.major) metaItems.push(<MetaItem key="major">{myProfile.major}</MetaItem>);

  const savedPlaces = places.slice(0, MAX_SAVED_PLACES);

  const prefs = [
    ["Role", ROLE_COPY[myProfile?.UserType]],
    ["Vehicle", myProfile?.Ride],
    ["Home base", myProfile?.Location],
  ].filter(([, value]) => Boolean(value));

  let studentIdNote = "not submitted";
  if (myProfile?.approvedAt) studentIdNote = `approved ${fmtMonth(myProfile.approvedAt)}`;
  else if (myProfile?.verified) studentIdNote = "approved";
  else if (myProfile?.requested) studentIdNote = "awaiting review";
  else if (myProfile?.rejected) studentIdNote = "not approved";

  let identityNote = "verify to drive";
  if (myProfile?.verifiedAt) identityNote = `verified ${fmtMonth(myProfile.verifiedAt)}`;
  else if (identityVerified) identityNote = "verified";

  const checklist = [
    ["School email", eduVerified, myProfile?.schoolemail || "not verified"],
    ["Student ID", Boolean(myProfile?.verified), studentIdNote],
    ["Phone", Boolean(myProfile?.Phone), myProfile?.Phone ? maskPhone(myProfile.Phone) : "add a number"],
    // The app's real document check is Persona, written to the profile by the
    // webhook; the Verifications collection holds a self-attestation instead.
    ["Identity", identityVerified, identityNote],
  ];

  return (
    <Page>
      <Banner>
        <BannerMap><MapBg /></BannerMap>
      </Banner>

      <Inner>
        <Header>
          <AvatarFrame>
            <Avatar user={{ name: fullName, hue: hueFor(currentUser?._id) }} size={120} />
          </AvatarFrame>

          <HeaderMain>
            <NameRow>
              <Name>{fullName}</Name>
              {eduVerified ? (
                <VerifiedChip>
                  <Icon name="check" size={11} color="#fff" strokeWidth={2.6} />
                  School email verified
                </VerifiedChip>
              ) : (
                <VerifyChip type="button" onClick={() => go("/verify")}>
                  <Icon name="school" size={11} />
                  Verify school email
                </VerifyChip>
              )}
            </NameRow>

            {metaItems.length > 0 && (
              <MetaRow>
                {metaItems.map((node, i) => (
                  <React.Fragment key={node.key}>
                    {i > 0 && <MetaSep>·</MetaSep>}
                    {node}
                  </React.Fragment>
                ))}
              </MetaRow>
            )}

            {myProfile?.Other && <Bio>{myProfile.Other}</Bio>}
          </HeaderMain>

          <HeaderActions>
            <GhostBtn type="button" onClick={() => go("/edit-profile")}>
              <Icon name="edit" size={14} />
              Edit profile
            </GhostBtn>
            <PrimaryBtn type="button" onClick={goSettings}>
              <Icon name="settings" size={14} color="var(--cream-0)" />
              Settings
            </PrimaryBtn>
          </HeaderActions>
        </Header>

        <StatStrip>
          <StatCard>
            <StatLabel>RATING</StatLabel>
            <StatValue>{ratingCount === 0 ? "—" : ratingAvg.toFixed(1)}</StatValue>
            <StatUnit>
              {ratingCount === 0 ? "no reviews yet" : (
                <>
                  <StatStar>★</StatStar>
                  {` from ${ratingCount} rider${ratingCount === 1 ? "" : "s"}`}
                </>
              )}
            </StatUnit>
          </StatCard>
          <StatCard>
            <StatLabel>RIDES</StatLabel>
            <StatValue>{completed.length}</StatValue>
            <StatUnit>completed</StatUnit>
          </StatCard>
          <StatCard>
            <StatLabel>MILES</StatLabel>
            <StatValue>{Math.round(milesShared)}</StatValue>
            <StatUnit>shared</StatUnit>
          </StatCard>
        </StatStrip>

        <Columns>
          <Col>
            <Card>
              <CardHead>
                <CardTitle>Saved places</CardTitle>
                <LinkBtn type="button" onClick={() => go("/places")}>+ Add</LinkBtn>
              </CardHead>
              {savedPlaces.length === 0 ? (
                <Empty>No saved places yet.</Empty>
              ) : (
                <PlaceGrid>
                  {savedPlaces.map((place, i) => {
                    const mine = place.createdBy === currentUser?._id;
                    const tint = PLACE_TINTS[i % PLACE_TINTS.length];
                    return (
                      <PlaceTile key={place._id}>
                        <PlaceIcon $tint={tint}>
                          <Icon name={mine ? "star" : "pin"} size={16} />
                        </PlaceIcon>
                        <PlaceText>
                          <PlaceName>{place.text}</PlaceName>
                          <PlaceSub>{place.value}</PlaceSub>
                        </PlaceText>
                      </PlaceTile>
                    );
                  })}
                </PlaceGrid>
              )}
            </Card>

            {reviews.length > 0 && (
              <Card>
                <CardTitle>What riders say</CardTitle>
                <ReviewList>
                  {reviews.slice(0, MAX_REVIEWS_SHOWN).map((review) => {
                    const name = authorName[review.author] || "Rider";
                    return (
                      <ReviewRow key={review._id}>
                        <Avatar user={{ name, hue: hueFor(review.author) }} size={36} />
                        <ReviewBody>
                          <ReviewHead>
                            <ReviewName>{name}</ReviewName>
                            <Stars>
                              {"★".repeat(review.stars)}
                              {"☆".repeat(5 - review.stars)}
                            </Stars>
                          </ReviewHead>
                          {review.text && <Quote>{`“${review.text}”`}</Quote>}
                        </ReviewBody>
                      </ReviewRow>
                    );
                  })}
                </ReviewList>
              </Card>
            )}
          </Col>

          <Col>
            <Card>
              <CardTitle>Ride preferences</CardTitle>
              {prefs.length === 0 ? (
                <Empty>Nothing set yet.</Empty>
              ) : (
                <PrefList>
                  {prefs.map(([label, value]) => (
                    <PrefRow key={label}>
                      <PrefLabel>{label}</PrefLabel>
                      <PrefValue>{value}</PrefValue>
                    </PrefRow>
                  ))}
                </PrefList>
              )}
              <CardFoot>
                <LinkBtn type="button" onClick={() => go("/edit-profile")}>
                  Add more in Edit profile
                </LinkBtn>
              </CardFoot>
            </Card>

            <Card>
              <CardTitle $tight>Verified</CardTitle>
              <CheckList>
                {checklist.map(([label, ok, note]) => (
                  <CheckRow key={label}>
                    <CheckMark $ok={ok}>
                      {ok && <Icon name="check" size={12} color="#fff" strokeWidth={3} />}
                    </CheckMark>
                    <CheckLabel>{label}</CheckLabel>
                    <CheckNote $ok={ok}>{note}</CheckNote>
                  </CheckRow>
                ))}
              </CheckList>
            </Card>
          </Col>
        </Columns>

        <SettingsSection ref={settingsRef}>
          <Section>
            <SectionTitle>ACCOUNT</SectionTitle>
            <MenuList>
              {!identityVerified && (
                <MenuItem type="button" onClick={verifyIdentity}>
                  <MenuItemIcon><Icon name="shield" size={17} /></MenuItemIcon>
                  <MenuItemLabel>Verify identity</MenuItemLabel>
                  <MenuArrow><Icon name="chevR" size={15} /></MenuArrow>
                </MenuItem>
              )}
              <MenuItem type="button" onClick={() => go("/edit-profile")}>
                <MenuItemIcon><Icon name="edit" size={17} /></MenuItemIcon>
                <MenuItemLabel>Edit profile</MenuItemLabel>
                <MenuArrow><Icon name="chevR" size={15} /></MenuArrow>
              </MenuItem>
              <MenuItem type="button" onClick={() => go("/places")}>
                <MenuItemIcon><Icon name="pin" size={17} /></MenuItemIcon>
                <MenuItemLabel>My places</MenuItemLabel>
                <MenuArrow><Icon name="chevR" size={15} /></MenuArrow>
              </MenuItem>
            </MenuList>
          </Section>

          {isAdmin && (
            <Section>
              <SectionTitle>ADMIN</SectionTitle>
              <MenuList>
                {ADMIN_LINKS.map(item => (
                  <MenuItem key={item.path} type="button" onClick={() => go(item.path)}>
                    <MenuItemIcon><Icon name={item.icon} size={17} /></MenuItemIcon>
                    <MenuItemLabel>{item.label}</MenuItemLabel>
                    <MenuArrow><Icon name="chevR" size={15} /></MenuArrow>
                  </MenuItem>
                ))}
              </MenuList>
            </Section>
          )}

          <Section>
            <SectionTitle>LEGAL &amp; INFO</SectionTitle>
            <MenuList>
              {LEGAL_LINKS.map(item => (
                <MenuItem key={item.path} type="button" onClick={() => go(item.path)}>
                  <MenuItemIcon><Icon name={item.icon} size={17} /></MenuItemIcon>
                  <MenuItemLabel>{item.label}</MenuItemLabel>
                  <MenuArrow><Icon name="chevR" size={15} /></MenuArrow>
                </MenuItem>
              ))}
            </MenuList>
          </Section>

          <Section>
            <SectionTitle $danger>DANGER ZONE</SectionTitle>
            <MenuList>
              <MenuItem type="button" $danger onClick={deleteAccount}>
                <MenuItemIcon><Icon name="close" size={17} /></MenuItemIcon>
                <MenuItemLabel>Delete account</MenuItemLabel>
                <MenuArrow><Icon name="chevR" size={15} /></MenuArrow>
              </MenuItem>
            </MenuList>
          </Section>

          <SignOutBtn type="button" onClick={() => go("/signout")}>
            Sign out
          </SignOutBtn>
        </SettingsSection>
      </Inner>
    </Page>
  );
};

Profile.propTypes = {
  history: PropTypes.shape({ push: PropTypes.func }).isRequired,
};

export default withRouter(Profile);
