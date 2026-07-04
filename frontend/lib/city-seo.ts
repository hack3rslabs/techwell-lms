export function createCityTrainingSchema({
  city,
  pageName,
  path,
  description,
}: {
  city: string;
  pageName: string;
  path: string;
  description: string;
}) {
  const url = `https://techwell.co.in${path}`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${url}/#webpage`,
        url,
        name: pageName,
        description,
        isPartOf: {
          "@id": "https://techwell.co.in/#website",
        },
        about: {
          "@id": "https://techwell.co.in/#organization",
        },
      },
      {
        "@type": "Service",
        name: pageName,
        description,
        provider: {
          "@id": "https://techwell.co.in/#organization",
        },
        areaServed: {
          "@type": "City",
          name: city,
          containedInPlace: {
            "@type": "AdministrativeArea",
            name: "Andhra Pradesh",
          },
        },
        serviceType: "IT and computer training",
        url,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: "https://techwell.co.in",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: pageName,
            item: url,
          },
        ],
      },
    ],
  };
}
