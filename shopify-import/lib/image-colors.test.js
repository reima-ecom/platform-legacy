import test from 'ava';
import setImageColors from './image-colors.js';

test('sets image colors', (t) => {
  const product = {
    resources: [
      { src: 'imgs/black-back.jpg' },
      { src: 'imgs/black-back.jpg' },
      { src: 'imgs/purple-back.jpg' },
      { src: 'imgs/purple-haze-back.jpg' },
      { src: 'imgs/purple-back.jpg' },
    ],
    options: [
      {
        name: 'Color',
        values: [
          { value: 'Purple' },
          { value: 'Black' },
          { value: 'Purple Haze' },
          { value: 'Trick color' },
        ],
      },
    ],
  };
  const expectedResources = [
    { src: 'imgs/black-back.jpg', params: { Color: 'Black' } },
    { src: 'imgs/black-back.jpg', params: { Color: 'Black' } },
    { src: 'imgs/purple-back.jpg', params: { Color: 'Purple' } },
    { src: 'imgs/purple-haze-back.jpg', params: { Color: 'Purple Haze' } },
    { src: 'imgs/purple-back.jpg', params: { Color: 'Purple' } },
  ];

  const actualResources = setImageColors(product).resources;
  t.deepEqual(actualResources, expectedResources);
});
